import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { VoteStatus } from '@chanban/shared-types';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { Vote } from '../entities/vote.entity';
import { PostSummary } from './entities/post-summary.entity';

const COMMENT_INVALIDATION_THRESHOLD = 10;
const MAX_COMMENTS_FOR_SUMMARY = 50;
const MIN_OPINION_COMMENTS = 3;
const MIN_VOTES_FOR_VOTE_SUMMARY = 10;

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);
  private readonly genai: GoogleGenAI;

  constructor(
    @InjectRepository(PostSummary)
    private readonly summaryRepository: Repository<PostSummary>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {
    this.genai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
  }

  /**
   * 게시글 생성 직후 호출. 본문 요약만 생성해서 저장한다.
   * 실패해도 게시글 생성에 영향을 주지 않도록 에러를 삼킨다.
   */
  async generateContentSummary(post: Post): Promise<void> {
    try {
      const contentSummary = await this.callContentSummaryApi(
        post.title,
        post.content,
      );

      await this.summaryRepository.upsert(
        {
          postId: post.id,
          contentSummary,
          commentCountAtGeneration: 0,
        },
        { conflictPaths: ['postId'] },
      );
    } catch (err) {
      this.logger.error(
        `Failed to generate content summary for post ${post.id}`,
        err,
      );
    }
  }

  /**
   * 요약 조회. commentSummary/voteSummary는 캐시 무효화 조건 충족 시 재생성한다.
   */
  async getSummary(postId: string): Promise<PostSummary | null> {
    const post = await this.postRepository.findOne({
      where: { id: postId, deletedAt: IsNull() },
    });

    if (!post) return null;

    const cached = await this.summaryRepository.findOne({ where: { postId } });

    const needsRegeneration =
      !cached ||
      post.commentCount - (cached.commentCountAtGeneration ?? 0) >=
        COMMENT_INVALIDATION_THRESHOLD;

    if (!needsRegeneration) return cached;

    try {
      return await this.regenerateCommentVoteSummary(post, cached ?? null);
    } catch (err) {
      this.logger.error(
        `Failed to regenerate summary for post ${postId}`,
        err,
      );
      return cached ?? null;
    }
  }

  private async regenerateCommentVoteSummary(
    post: Post,
    cached: PostSummary | null,
  ): Promise<PostSummary> {
    const comments = await this.commentRepository.find({
      where: { postId: post.id, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: MAX_COMMENTS_FOR_SUMMARY,
      relations: ['user'],
    });

    const votes = await this.voteRepository.find({
      where: { postId: post.id },
      select: ['userId', 'currentStatus'],
    });

    const [{ agreeSummary, disagreeSummary, voteSummary }, contentSummary] =
      await Promise.all([
        this.callCommentVoteSummaryApi(post, comments, votes),
        cached?.contentSummary
          ? Promise.resolve(cached.contentSummary)
          : this.callContentSummaryApi(post.title, post.content),
      ]);

    await this.summaryRepository.upsert(
      {
        postId: post.id,
        contentSummary,
        voteSummary,
        agreeSummary,
        disagreeSummary,
        commentCountAtGeneration: post.commentCount,
      },
      { conflictPaths: ['postId'] },
    );

    const updated = await this.summaryRepository.findOne({
      where: { postId: post.id },
    });

    return updated!;
  }

  private async callContentSummaryApi(
    title: string,
    content: string,
  ): Promise<string> {
    const prompt = `당신은 온라인 토론 게시글을 요약하는 어시스턴트입니다.
아래 게시글을 2~3문장으로 간결하게 요약해주세요.

제목: ${title}
내용: ${content}`;

    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ?? '';
  }

  private async callCommentVoteSummaryApi(
    post: Post,
    comments: Comment[],
    votes: Vote[],
  ): Promise<{
    agreeSummary: string | null;
    disagreeSummary: string | null;
    voteSummary: string | null;
  }> {
    const voteMap = new Map(votes.map((v) => [v.userId, v.currentStatus]));

    const agreeComments = comments.filter(
      (c) => voteMap.get(c.userId) === VoteStatus.AGREE,
    );
    const disagreeComments = comments.filter(
      (c) => voteMap.get(c.userId) === VoteStatus.DISAGREE,
    );

    const totalVotes = post.agreeCount + post.disagreeCount + post.neutralCount;
    const needsVoteSummary = totalVotes >= MIN_VOTES_FOR_VOTE_SUMMARY;
    const needsAgreeSummary = agreeComments.length >= MIN_OPINION_COMMENTS;
    const needsDisagreeSummary = disagreeComments.length >= MIN_OPINION_COMMENTS;

    if (!needsVoteSummary && !needsAgreeSummary && !needsDisagreeSummary) {
      return { voteSummary: null, agreeSummary: null, disagreeSummary: null };
    }

    const toLines = (list: Comment[]) =>
      list.map((c, i) => `${i + 1}. ${c.user?.nickname ?? '익명'}: ${c.content}`).join('\n');

    const sections: string[] = [
      `[투표 현황]\n찬성: ${post.agreeCount}표 / 반대: ${post.disagreeCount}표 / 중립: ${post.neutralCount}표`,
      ...(needsAgreeSummary ? [`[찬성 측 댓글]\n${toLines(agreeComments)}`] : []),
      ...(needsDisagreeSummary ? [`[반대 측 댓글]\n${toLines(disagreeComments)}`] : []),
    ];

    const requiredFields = [
      ...(needsVoteSummary ? ['"voteSummary": "전체 투표 현황 요약"'] : []),
      ...(needsAgreeSummary ? ['"agreeSummary": "찬성 측 의견 요약"'] : []),
      ...(needsDisagreeSummary ? ['"disagreeSummary": "반대 측 의견 요약"'] : []),
    ].join(',\n  ');

    const prompt = `당신은 온라인 토론 게시글의 반응을 요약하는 어시스턴트입니다.

${sections.join('\n\n')}

아래 항목을 각각 2~3문장으로 요약하고, 반드시 JSON 형식으로만 응답해주세요.
{
  ${requiredFields}
}`;

    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const raw = response.text ?? '{}';
    const parsed = JSON.parse(raw) as {
      voteSummary?: string;
      agreeSummary?: string;
      disagreeSummary?: string;
    };

    return {
      voteSummary: needsVoteSummary ? (parsed.voteSummary ?? '') : null,
      agreeSummary: needsAgreeSummary ? (parsed.agreeSummary ?? '') : null,
      disagreeSummary: needsDisagreeSummary ? (parsed.disagreeSummary ?? '') : null,
    };
  }
}
