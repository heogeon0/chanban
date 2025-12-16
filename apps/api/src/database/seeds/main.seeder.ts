import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Vote } from '../../entities/vote.entity';
import { Comment } from '../../entities/comment.entity';
import { PostTag, VoteStatus } from '../../entities/enums';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const postRepository = dataSource.getRepository(Post);
    const voteRepository = dataSource.getRepository(Vote);
    const commentRepository = dataSource.getRepository(Comment);

    // 기존 데이터 확인
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('데이터가 이미 존재합니다. 시딩을 건너뜁니다.');
      return;
    }

    console.log('초기 데이터를 생성합니다...');

    // 1. 사용자 생성
    const users = await userRepository.save([
      {
        kakaoId: '1234567890',
        nickname: '철수',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      {
        kakaoId: '1234567891',
        nickname: '영희',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      {
        kakaoId: '1234567892',
        nickname: '민수',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      {
        kakaoId: '1234567893',
        nickname: '지영',
        profileImageUrl: null,
      },
      {
        kakaoId: '1234567894',
        nickname: '동현',
        profileImageUrl: null,
      },
    ]);

    console.log(`✅ ${users.length}명의 사용자 생성 완료`);

    // 2. 게시글 생성
    const posts = await postRepository.save([
      {
        creatorId: users[0].id,
        title: '기본소득제 도입에 찬성하시나요?',
        content:
          '모든 국민에게 조건 없이 일정 금액을 지급하는 기본소득제에 대한 여러분의 의견을 듣고 싶습니다. 찬성하시나요, 반대하시나요?',
        tag: PostTag.POLITICS,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 0,
        disagreeCount: 0,
        neutralCount: 0,
        popularityScore: 0,
      },
      {
        creatorId: users[1].id,
        title: '주 4일 근무제, 한국에서도 가능할까요?',
        content:
          '최근 여러 나라에서 주 4일 근무제를 시범 운영하고 있습니다. 한국 기업 문화에서도 실현 가능하다고 생각하시나요?',
        tag: PostTag.ECONOMY,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 0,
        disagreeCount: 0,
        neutralCount: 0,
        popularityScore: 0,
      },
      {
        creatorId: users[2].id,
        title: 'AI가 인간의 일자리를 대체할까요?',
        content:
          'ChatGPT를 비롯한 생성형 AI의 발전으로 많은 직업이 위협받고 있습니다. AI가 결국 대부분의 인간 일자리를 대체할 것이라고 생각하시나요?',
        tag: PostTag.TECHNOLOGY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.NEUTRAL,
        agreeCount: 0,
        disagreeCount: 0,
        neutralCount: 0,
        popularityScore: 0,
      },
      {
        creatorId: users[0].id,
        title: '학교에서 스마트폰 사용 전면 금지, 찬성하시나요?',
        content:
          '청소년의 스마트폰 중독이 심각한 문제로 대두되고 있습니다. 학교에서 수업 시간은 물론 쉬는 시간에도 스마트폰 사용을 전면 금지하는 것에 대해 어떻게 생각하시나요?',
        tag: PostTag.SOCIETY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.DISAGREE,
        agreeCount: 0,
        disagreeCount: 0,
        neutralCount: 0,
        popularityScore: 0,
      },
      {
        creatorId: users[3].id,
        title: 'K-POP 아이돌 산업의 과도한 경쟁, 규제가 필요할까요?',
        content:
          '데뷔를 위한 치열한 경쟁과 혹독한 연습생 시스템이 논란이 되고 있습니다. K-POP 산업에 대한 법적 규제가 필요하다고 생각하시나요?',
        tag: PostTag.ENTERTAINMENT,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 0,
        disagreeCount: 0,
        neutralCount: 0,
        popularityScore: 0,
      },
    ]);

    console.log(`✅ ${posts.length}개의 게시글 생성 완료`);

    // 3. 투표 생성
    const votes = await voteRepository.save([
      {
        postId: posts[0].id,
        userId: users[1].id,
        currentStatus: VoteStatus.AGREE,
        changeCount: 0,
        lastChangedAt: null,
      },
      {
        postId: posts[0].id,
        userId: users[2].id,
        currentStatus: VoteStatus.DISAGREE,
        changeCount: 0,
        lastChangedAt: null,
      },
      {
        postId: posts[1].id,
        userId: users[0].id,
        currentStatus: VoteStatus.NEUTRAL,
        changeCount: 0,
        lastChangedAt: null,
      },
      {
        postId: posts[2].id,
        userId: users[3].id,
        currentStatus: VoteStatus.AGREE,
        changeCount: 0,
        lastChangedAt: null,
      },
    ]);

    console.log(`✅ ${votes.length}개의 투표 생성 완료`);

    // 4. 투표 수 업데이트
    await postRepository.update(posts[0].id, {
      agreeCount: 1,
      disagreeCount: 1,
    });
    await postRepository.update(posts[1].id, { neutralCount: 1 });
    await postRepository.update(posts[2].id, { agreeCount: 1 });

    // 5. 댓글 생성
    const comments = await commentRepository.save([
      {
        postId: posts[0].id,
        userId: users[2].id,
        parentId: null,
        content: '기본소득제는 재정 부담이 너무 크다고 생각합니다.',
        likeCount: 0,
      },
      {
        postId: posts[0].id,
        userId: users[3].id,
        parentId: null,
        content: '하지만 자동화로 일자리가 줄어드는 상황에서 필요한 제도라고 봅니다.',
        likeCount: 0,
      },
      {
        postId: posts[1].id,
        userId: users[4].id,
        parentId: null,
        content: '생산성이 높아진다면 충분히 가능하다고 생각해요!',
        likeCount: 0,
      },
    ]);

    console.log(`✅ ${comments.length}개의 댓글 생성 완료`);

    // 6. 댓글 수 업데이트
    await postRepository.update(posts[0].id, { commentCount: 2 });
    await postRepository.update(posts[1].id, { commentCount: 1 });

    console.log('✅ 모든 초기 데이터 생성 완료!');
  }
}
