import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PostTag, VoteStatus } from '@chanban/shared-types';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Vote } from '../../entities/vote.entity';
import { Comment } from '../../entities/comment.entity';
import { CommentLike } from '../../entities/comment-like.entity';

/**
 * 테스트용 대량 데이터 생성 시더
 * 댓글이 많은 게시글을 생성합니다.
 */
export class TestDataSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const postRepository = dataSource.getRepository(Post);
    const voteRepository = dataSource.getRepository(Vote);
    const commentRepository = dataSource.getRepository(Comment);
    const commentLikeRepository = dataSource.getRepository(CommentLike);

    console.log('🧪 테스트용 대량 데이터를 생성합니다...');

    // 1. 테스트용 사용자 20명 생성
    const testUsers: User[] = [];
    for (let i = 0; i < 20; i++) {
      const existingUser = await userRepository.findOne({
        where: { kakaoId: `test_user_${i}` },
      });

      if (existingUser) {
        testUsers.push(existingUser);
      } else {
        const user = await userRepository.save({
          kakaoId: `test_user_${i}`,
          nickname: `테스트유저${i + 1}`,
          profileImageUrl:
            i % 3 === 0 ? null : `https://picsum.photos/seed/user${i}/150/150`,
        });
        testUsers.push(user);
      }
    }
    console.log(`✅ ${testUsers.length}명의 테스트 사용자 준비 완료`);

    // 2. 댓글이 많은 핫 토픽 게시글 생성
    const hotPost = await postRepository.save({
      creatorId: testUsers[0].id,
      title: '🔥 [테스트] 댓글 폭발 게시글 - 커피 vs 녹차',
      content: `이 게시글은 테스트용으로 생성된 게시글입니다.

      여러분은 아침에 무엇을 마시나요?
      커피파와 녹차파의 뜨거운 논쟁이 예상됩니다!

      - 커피: 찬성 (커피가 최고!)
      - 녹차: 반대 (녹차가 건강에 좋아요)
      - 둘 다 좋아: 중립

      자유롭게 의견을 나눠주세요! 🎉`,
      tag: PostTag.OTHER,
      showCreatorOpinion: true,
      creatorOpinion: VoteStatus.AGREE,
      agreeCount: 0,
      disagreeCount: 0,
      neutralCount: 0,
      commentCount: 0,
      viewCount: 0,
      popularityScore: 0,
    });
    console.log(`✅ 핫 토픽 게시글 생성: ${hotPost.id}`);

    // 3. 투표 생성 (각 사용자당 1개)
    let agreeCount = 0;
    let disagreeCount = 0;
    let neutralCount = 0;

    for (let i = 1; i < testUsers.length; i++) {
      const statuses = [VoteStatus.AGREE, VoteStatus.DISAGREE, VoteStatus.NEUTRAL];
      const status = statuses[i % 3];

      if (status === VoteStatus.AGREE) agreeCount++;
      else if (status === VoteStatus.DISAGREE) disagreeCount++;
      else neutralCount++;

      await voteRepository.save({
        postId: hotPost.id,
        userId: testUsers[i].id,
        currentStatus: status,
        changeCount: Math.floor(Math.random() * 3),
        lastChangedAt: Math.random() > 0.5 ? new Date() : null,
      });
    }
    console.log(`✅ ${testUsers.length - 1}개의 투표 생성 완료`);

    // 4. 댓글 템플릿
    const commentTemplates = {
      [VoteStatus.AGREE]: [
        '커피 없이는 아침을 시작할 수 없어요 ☕',
        '에스프레소 한 잔이 하루를 바꿉니다!',
        '카페인이 필요해... 커피가 답이죠',
        '커피 향기만으로도 행복해져요',
        '아메리카노가 최고입니다',
        '커피를 마시면 집중력이 확 올라가요',
        '모닝 커피는 진리입니다',
        '커피는 문화이자 예술이에요',
        '바리스타 커피 한 잔의 여유가 좋아요',
        '커피 없으면 일을 못 해요 ㅋㅋ',
      ],
      [VoteStatus.DISAGREE]: [
        '녹차의 은은한 향이 좋아요 🍵',
        '카페인 걱정 없는 녹차가 건강에 좋습니다',
        '녹차 한 잔으로 마음이 편안해져요',
        '항산화 효과는 녹차가 최고!',
        '녹차 라떼도 맛있어요',
        '카테킨 성분이 건강에 좋대요',
        '녹차는 다이어트에도 도움이 됩니다',
        '전통 차의 매력을 아시나요?',
        '녹차 아이스크림도 맛있잖아요',
        '녹차의 쓴맛이 중독성 있어요',
      ],
      [VoteStatus.NEUTRAL]: [
        '둘 다 좋은데... 고르기 힘들어요',
        '아침엔 커피, 오후엔 녹차!',
        '상황에 따라 다른 것 같아요',
        '커피도 녹차도 각자의 매력이 있죠',
        '왜 하나만 골라야 하나요? ㅋㅋ',
        '기분에 따라 선택합니다',
        '둘 다 안 마시면 안 되나요?',
        '취향 존중해요~',
        '논쟁할 필요 없이 둘 다 마셔요',
        '녹차 라떼 속 커피 시럽 추가ㅋㅋ',
      ],
    };

    const replyTemplates = [
      '동의합니다!',
      '그건 좀 아닌 것 같은데요...',
      '좋은 의견이네요',
      '저도 같은 생각이에요',
      '그렇게 생각하실 수도 있겠네요',
      'ㅋㅋㅋㅋ',
      '인정합니다',
      '오 새로운 관점이네요',
      '공감해요!',
      '저는 조금 다르게 생각해요',
      '맞아요 맞아요',
      '그건 좀...',
      '재밌네요 ㅎㅎ',
      '논리적이네요',
      '설득력 있어요',
    ];

    // 5. 댓글 100개 생성 (부모 댓글)
    const parentComments: Comment[] = [];
    const PARENT_COMMENT_COUNT = 100;

    for (let i = 0; i < PARENT_COMMENT_COUNT; i++) {
      const userIndex = i % testUsers.length;
      const user = testUsers[userIndex];
      const status = [VoteStatus.AGREE, VoteStatus.DISAGREE, VoteStatus.NEUTRAL][
        i % 3
      ] as VoteStatus;
      const templates = commentTemplates[status];
      const content = templates[Math.floor(Math.random() * templates.length)];

      const comment = await commentRepository.save({
        postId: hotPost.id,
        userId: user.id,
        parentId: null,
        content: `${content} (댓글 #${i + 1})`,
        likeCount: 0,
      });
      parentComments.push(comment);

      if ((i + 1) % 20 === 0) {
        console.log(`  📝 부모 댓글 ${i + 1}/${PARENT_COMMENT_COUNT} 생성 중...`);
      }
    }
    console.log(`✅ ${PARENT_COMMENT_COUNT}개의 부모 댓글 생성 완료`);

    // 6. 대댓글 200개 생성 (일부 댓글에 여러 개의 대댓글)
    const REPLY_COUNT = 200;
    const replies: Comment[] = [];

    for (let i = 0; i < REPLY_COUNT; i++) {
      const parentIndex = Math.floor(Math.random() * Math.min(50, parentComments.length));
      const parent = parentComments[parentIndex];
      const userIndex = (i + 5) % testUsers.length;
      const user = testUsers[userIndex];
      const content = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

      const reply = await commentRepository.save({
        postId: hotPost.id,
        userId: user.id,
        parentId: parent.id,
        content: `${content} (대댓글 #${i + 1})`,
        likeCount: 0,
      });
      replies.push(reply);

      if ((i + 1) % 50 === 0) {
        console.log(`  💬 대댓글 ${i + 1}/${REPLY_COUNT} 생성 중...`);
      }
    }
    console.log(`✅ ${REPLY_COUNT}개의 대댓글 생성 완료`);

    // 7. 댓글 좋아요 생성 (랜덤)
    const allComments = [...parentComments, ...replies];
    let likeCount = 0;
    const LIKE_TARGET = 500;

    for (let i = 0; i < LIKE_TARGET; i++) {
      const comment = allComments[Math.floor(Math.random() * allComments.length)];
      const user = testUsers[Math.floor(Math.random() * testUsers.length)];

      // 이미 좋아요 했는지 체크
      const existingLike = await commentLikeRepository.findOne({
        where: { commentId: comment.id, userId: user.id },
      });

      if (!existingLike) {
        await commentLikeRepository.save({
          commentId: comment.id,
          userId: user.id,
        });

        // 댓글의 likeCount 증가
        await commentRepository.increment({ id: comment.id }, 'likeCount', 1);
        likeCount++;
      }
    }
    console.log(`✅ ${likeCount}개의 댓글 좋아요 생성 완료`);

    // 8. 게시글 통계 업데이트
    const totalComments = PARENT_COMMENT_COUNT + REPLY_COUNT;
    await postRepository.update(hotPost.id, {
      agreeCount,
      disagreeCount,
      neutralCount,
      commentCount: totalComments,
      viewCount: Math.floor(Math.random() * 10000) + 5000,
      popularityScore: 99,
    });

    console.log('\n📊 생성된 데이터 요약:');
    console.log(`  - 게시글 ID: ${hotPost.id}`);
    console.log(`  - 테스트 사용자: ${testUsers.length}명`);
    console.log(`  - 투표: 찬성 ${agreeCount} / 반대 ${disagreeCount} / 중립 ${neutralCount}`);
    console.log(`  - 부모 댓글: ${PARENT_COMMENT_COUNT}개`);
    console.log(`  - 대댓글: ${REPLY_COUNT}개`);
    console.log(`  - 총 댓글: ${totalComments}개`);
    console.log(`  - 댓글 좋아요: ${likeCount}개`);
    console.log('\n✅ 테스트 데이터 생성 완료! 🎉');
  }
}
