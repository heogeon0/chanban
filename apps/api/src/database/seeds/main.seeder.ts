import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PostTag, VoteStatus } from '@chanban/shared-types';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Vote } from '../../entities/vote.entity';
import { Comment } from '../../entities/comment.entity';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const postRepository = dataSource.getRepository(Post);
    const voteRepository = dataSource.getRepository(Vote);
    const commentRepository = dataSource.getRepository(Comment);

    console.log('초기 데이터를 생성합니다...');

    // 1. 기존 사용자 확인 또는 새로 생성
    let users = await userRepository.find();

    // 시드용 더미 사용자 데이터
    const dummyUsers = [
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
    ];

    // 사용자가 5명 미만이면 부족한 만큼 추가
    if (users.length < 5) {
      const existingKakaoIds = users.map((u) => u.kakaoId);
      const usersToAdd = dummyUsers.filter(
        (du) => !existingKakaoIds.includes(du.kakaoId),
      );

      if (usersToAdd.length > 0) {
        const newUsers = await userRepository.save(usersToAdd);
        users = [...users, ...newUsers];
        console.log(`✅ ${newUsers.length}명의 사용자 추가 생성 완료`);
      }
    }

    console.log(`✅ 총 ${users.length}명의 사용자 사용`);

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
        agreeCount: 1523,
        disagreeCount: 892,
        neutralCount: 234,
        viewCount: 15000,
        popularityScore: 95,
      },
      {
        creatorId: users[1].id,
        title: '주 4일 근무제, 한국에서도 가능할까요?',
        content:
          '최근 여러 나라에서 주 4일 근무제를 시범 운영하고 있습니다. 한국 기업 문화에서도 실현 가능하다고 생각하시나요?',
        tag: PostTag.ECONOMY,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 2341,
        disagreeCount: 1876,
        neutralCount: 1532,
        viewCount: 32000,
        popularityScore: 98,
      },
      {
        creatorId: users[2].id,
        title: 'AI가 인간의 일자리를 대체할까요?',
        content:
          'ChatGPT를 비롯한 생성형 AI의 발전으로 많은 직업이 위협받고 있습니다. AI가 결국 대부분의 인간 일자리를 대체할 것이라고 생각하시나요?',
        tag: PostTag.TECHNOLOGY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.NEUTRAL,
        agreeCount: 3456,
        disagreeCount: 892,
        neutralCount: 567,
        viewCount: 45000,
        popularityScore: 99,
      },
      {
        creatorId: users[0].id,
        title: '학교에서 스마트폰 사용 전면 금지, 찬성하시나요?',
        content:
          '청소년의 스마트폰 중독이 심각한 문제로 대두되고 있습니다. 학교에서 수업 시간은 물론 쉬는 시간에도 스마트폰 사용을 전면 금지하는 것에 대해 어떻게 생각하시나요?',
        tag: PostTag.SOCIETY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.DISAGREE,
        agreeCount: 456,
        disagreeCount: 1234,
        neutralCount: 321,
        viewCount: 8900,
        popularityScore: 72,
      },
      {
        creatorId: users[3].id,
        title: 'K-POP 아이돌 산업의 과도한 경쟁, 규제가 필요할까요?',
        content:
          '데뷔를 위한 치열한 경쟁과 혹독한 연습생 시스템이 논란이 되고 있습니다. K-POP 산업에 대한 법적 규제가 필요하다고 생각하시나요?',
        tag: PostTag.ENTERTAINMENT,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 2100,
        disagreeCount: 3400,
        neutralCount: 890,
        viewCount: 28000,
        popularityScore: 88,
      },
      {
        creatorId: users[4].id,
        title: '손흥민 vs 김민재, 누가 더 위대한 선수인가?',
        content:
          '프리미어리그와 세리에A에서 활약 중인 두 선수. 포지션은 다르지만, 한국 축구 역사상 누가 더 위대한 선수로 기억될까요?',
        tag: PostTag.SPORTS,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 4521,
        disagreeCount: 3892,
        neutralCount: 1234,
        viewCount: 52000,
        popularityScore: 97,
      },
      {
        creatorId: users[1].id,
        title: '짜장면 vs 짬뽕, 당신의 선택은?',
        content:
          '중국집의 영원한 딜레마. 짜장면과 짬뽕 중 하나만 골라야 한다면 당신은 무엇을 선택하시겠습니까?',
        tag: PostTag.OTHER,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 8923,
        disagreeCount: 7654,
        neutralCount: 2341,
        viewCount: 89000,
        popularityScore: 100,
      },
      {
        creatorId: users[2].id,
        title: '원자력 발전소 확대, 친환경인가 위험인가?',
        content:
          '탄소중립 달성을 위해 원자력 발전소 확대가 필요하다는 주장과 안전성 문제를 제기하는 반대 의견이 팽팽합니다. 당신의 생각은?',
        tag: PostTag.SOCIETY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.NEUTRAL,
        agreeCount: 1890,
        disagreeCount: 1765,
        neutralCount: 2100,
        viewCount: 19000,
        popularityScore: 85,
      },
      {
        creatorId: users[3].id,
        title: '대학 입시 수시 확대, 공정한가?',
        content:
          '수시 전형 비율이 계속 증가하는 가운데, 학생부종합전형의 공정성 논란이 이어지고 있습니다. 수시 확대는 옳은 방향일까요?',
        tag: PostTag.SOCIETY,
        showCreatorOpinion: false,
        creatorOpinion: VoteStatus.DISAGREE,
        agreeCount: 567,
        disagreeCount: 1432,
        neutralCount: 389,
        viewCount: 7800,
        popularityScore: 65,
      },
      {
        creatorId: users[4].id,
        title: '게임 셧다운제 폐지, 올바른 결정인가?',
        content:
          '청소년 게임 이용 시간을 제한하던 셧다운제가 폐지되었습니다. 자율성 존중인가, 청소년 보호 포기인가? 여러분의 의견을 들려주세요.',
        tag: PostTag.TECHNOLOGY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 3421,
        disagreeCount: 1234,
        neutralCount: 567,
        viewCount: 23000,
        popularityScore: 82,
      },
      {
        creatorId: users[0].id,
        title: '대통령 탄핵 절차, 헌법적으로 정당한가?',
        content:
          '최근 정치적 혼란 속에서 탄핵 절차의 헌법적 정당성에 대한 논의가 활발합니다. 헌법재판소의 역할과 국회의 권한 범위에 대해 여러분의 의견을 듣고 싶습니다.',
        tag: PostTag.POLITICS,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 2890,
        disagreeCount: 1567,
        neutralCount: 432,
        viewCount: 35000,
        popularityScore: 92,
      },
      {
        creatorId: users[1].id,
        title: 'MZ세대의 조용한 퇴사, 정당한 선택인가?',
        content:
          '최근 MZ세대 사이에서 "조용한 퇴사(Quiet Quitting)" 현상이 주목받고 있습니다. 이는 정당한 자기 보호인가, 아니면 책임 회피인가?',
        tag: PostTag.SOCIETY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 4567,
        disagreeCount: 1234,
        neutralCount: 789,
        viewCount: 48000,
        popularityScore: 96,
      },
      {
        creatorId: users[2].id,
        title: '전기차 보조금 축소, 맞는 방향인가?',
        content:
          '정부가 전기차 보조금을 점진적으로 축소하고 있습니다. 시장 성숙에 따른 자연스러운 정책인지, 친환경 전환을 늦추는 역행인지 의견을 나눠주세요.',
        tag: PostTag.ECONOMY,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.DISAGREE,
        agreeCount: 1234,
        disagreeCount: 2567,
        neutralCount: 890,
        viewCount: 18000,
        popularityScore: 78,
      },
      {
        creatorId: users[3].id,
        title: '넷플릭스 한국 콘텐츠, 글로벌 경쟁력 있을까?',
        content:
          '오징어 게임, 더 글로리 등 K-드라마의 글로벌 성공이 계속되고 있습니다. 한국 콘텐츠가 할리우드와 경쟁할 수 있을까요?',
        tag: PostTag.ENTERTAINMENT,
        showCreatorOpinion: true,
        creatorOpinion: VoteStatus.AGREE,
        agreeCount: 5678,
        disagreeCount: 432,
        neutralCount: 567,
        viewCount: 67000,
        popularityScore: 94,
      },
      {
        creatorId: users[4].id,
        title: '프로야구 외국인 선수 쿼터 확대, 필요한가?',
        content:
          'KBO 리그의 경기력 향상을 위해 외국인 선수 쿼터를 확대해야 한다는 의견이 있습니다. 국내 선수 육성과 리그 발전, 어느 쪽이 더 중요할까요?',
        tag: PostTag.SPORTS,
        showCreatorOpinion: false,
        creatorOpinion: null,
        agreeCount: 1567,
        disagreeCount: 2345,
        neutralCount: 678,
        viewCount: 12000,
        popularityScore: 68,
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

    // 4. 투표 수 업데이트 (시드 데이터에 이미 카운트가 반영되어 있음)

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
    await postRepository.update(posts[0].id, { commentCount: 456 });
    await postRepository.update(posts[1].id, { commentCount: 789 });
    await postRepository.update(posts[2].id, { commentCount: 1023 });
    await postRepository.update(posts[3].id, { commentCount: 234 });
    await postRepository.update(posts[4].id, { commentCount: 567 });
    await postRepository.update(posts[5].id, { commentCount: 892 });
    await postRepository.update(posts[6].id, { commentCount: 2345 });
    await postRepository.update(posts[7].id, { commentCount: 432 });
    await postRepository.update(posts[8].id, { commentCount: 178 });
    await postRepository.update(posts[9].id, { commentCount: 678 });
    await postRepository.update(posts[10].id, { commentCount: 345 });
    await postRepository.update(posts[11].id, { commentCount: 567 });
    await postRepository.update(posts[12].id, { commentCount: 234 });
    await postRepository.update(posts[13].id, { commentCount: 890 });
    await postRepository.update(posts[14].id, { commentCount: 123 });

    console.log('✅ 모든 초기 데이터 생성 완료!');
  }
}
