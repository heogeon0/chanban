# @chanban/shared-types

프론트엔드와 백엔드에서 공유하는 타입 정의 패키지입니다.

## 설치

이미 pnpm workspace로 설정되어 있습니다.

```bash
# 루트에서 설치
pnpm install
```

## 빌드

```bash
cd packages/shared-types
pnpm build
```

## 사용법

### 백엔드 (apps/api)

```typescript
import { PostTag, ErrorCode, PaginatedResponse, PostResponse } from '@chanban/shared-types';

// Enum 사용
const tag: PostTag = PostTag.POLITICS;

// 에러 처리
throw new BadRequestException({
  code: ErrorCode.INVALID_POST_TAG,
  message: 'Invalid tag',
});

// 응답 타입
const response: PaginatedResponse<PostResponse> = {
  data: [...],
  meta: { total, page, limit, totalPages }
};
```

### 프론트엔드 (apps/web)

```typescript
import { PostTag, PostResponse, PaginatedResponse } from '@chanban/shared-types';

// API 응답 타입
const fetchPosts = async (): Promise<PaginatedResponse<PostResponse>> => {
  const response = await fetch('/api/posts/recent');
  return response.json();
};
```

## 포함된 타입

### Enums
- `PostTag`: 포스트 태그 (politics, society, economy, etc.)
- `VoteStatus`: 투표 상태 (agree, disagree, neutral)
- `PostSortBy`: 정렬 기준 (recent, popular)
- `SortOrder`: 정렬 순서 (ASC, DESC)

### Error Types
- `ErrorCode`: 에러 코드 enum
- `ApiErrorResponse`: 에러 응답 인터페이스

### API Response Types
- `ApiResponse<T>`: 기본 API 응답
- `PaginationMeta`: 페이징 메타데이터
- `PaginatedResponse<T>`: 페이징된 응답

### Entity Types
- `UserResponse`: 유저 정보
- `PostResponse`: 포스트 정보

## 개발

타입을 추가/수정한 후:

1. `pnpm build` 실행
2. 루트에서 `pnpm install` 실행 (필요시)
3. 백엔드/프론트엔드에서 import하여 사용
