import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { PostSummary } from './entities/post-summary.entity';

const COMMENT_INVALIDATION_THRESHOLD = 10;
const MAX_COMMENTS_FOR_SUMMARY = 50;

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

    return this.regenerateCommentVoteSummary(post, cached ?? null);
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

    const { commentSummary, voteSummary } =
      await this.callCommentVoteSummaryApi(post, comments);

    const result = await this.summaryRepository.upsert(
      {
        postId: post.id,
        contentSummary: cached?.contentSummary ?? null,
        commentSummary,
        voteSummary,
        commentCountAtGeneration: post.commentCount,
      },
      { conflictPaths: ['postId'] },
    );

    const savedId = result.identifiers[0]?.id as string | undefined;
    const updated = await this.summaryRepository.findOne({
      where: savedId ? { id: savedId } : { postId: post.id },
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
  ): Promise<{ commentSummary: string; voteSummary: string }> {
    const commentLines = comments
      .map((c, i) => `${i + 1}. ${c.user?.nickname ?? '익명'}: ${c.content}`)
      .join('\n');

    const prompt = `당신은 온라인 토론 게시글의 반응을 요약하는 어시스턴트입니다.

[투표 현황]
찬성: ${post.agreeCount}표 / 반대: ${post.disagreeCount}표 / 중립: ${post.neutralCount}표

[댓글]
${commentLines || '(댓글 없음)'}

아래 두 가지를 각각 2~3문장으로 요약하고, 반드시 JSON 형식으로만 응답해주세요.
{
  "commentSummary": "...",
  "voteSummary": "..."
}`;

    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text ?? '{}';
    const parsed = JSON.parse(raw) as {
      commentSummary?: string;
      voteSummary?: string;
    };

    return {
      commentSummary: parsed.commentSummary ?? '',
      voteSummary: parsed.voteSummary ?? '',
    };
  }
}
