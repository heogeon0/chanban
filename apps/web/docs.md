# Web Frontend Architecture

## 폴더 구조

```
app/
  {page}/
    widgets/      # 페이지 전용 위젯
    features/     # 페이지 전용 훅
    domains/      # 페이지 전용 비즈니스 로직
    page.tsx
    {subpage}/
      widgets/
      features/
      domains/
      page.tsx

shared/
  ui/             # 공통 UI 컴포넌트
  queries/        # API 쿼리 함수 + 쿼리키
```

## 레이어 정의

### 1. widgets
- 현재의 `_components` 역할
- features, domains, queries, ui를 조합한 **완성된 기능 단위**
- 페이지에서 직접 사용되는 컴포넌트
- tanstack query를 직접 호출하는것도 가능 (shared의 쿼리 활용), 무한스크롤같이 복잡한 경우에는 features에서 만들어서 호출

### 2. features
- 현재의 `_hooks` 역할
- React 라이프사이클을 공유하는 **기능 단위**
- widgets와 결합되어 사용됨

### 3. domains
- **비즈니스 로직**을 포함
- **순수 함수** 형태로 작성
- React에 의존하지 않음
- 쿼리의 select 함수도 domain에 포함됨.

### 4. shared/ui
- 프로젝트 전역에서 사용되는 **공통 UI 컴포넌트**
- Button, Avatar, Badge 등

### 5. shared/queries
- API를 호출하는 **쿼리 함수**
- **쿼리키** 정의

## 호출 규칙

### 수직 호출 (레이어 간)

```
widgets → features → domains → shared
```

- widgets는 features, domains, shared를 호출할 수 있음
- features는 domains, shared를 호출할 수 있음
- domains는 shared만 호출할 수 있음
- **역순 호출 금지**: domains → features (X), features → widgets (X)

### 수평 호출 (페이지 간)

```
상위 페이지 ← 하위 페이지
```

- 하위 페이지는 상위 페이지의 레이어를 호출할 수 있음
- **역순 호출 금지**: 상위 페이지 → 하위 페이지 (X)

예시:
```
app/topics/         → app/topics/[id]/  (X) 호출 불가
app/topics/[id]/    → app/topics/       (O) 호출 가능
```

## 예시 구조

```
app/
  topics/
    widgets/
      topic-list.tsx
      topic-create-form.tsx
    features/
      use-topic-filter.ts
    domains/
      validate-topic.ts
    page.tsx
    [id]/
      widgets/
        topic-detail.tsx
        comment.tsx
        comment-form.tsx
      features/
        use-vote.ts
        use-comment.ts
      domains/
        format-date.ts
      page.tsx

shared/
  ui/
    button.tsx
    avatar.tsx
    badge.tsx
    textarea.tsx
  lib/
  utils/
  queries/
    topic.ts        # getTopics, getTopic, createTopic...
    comment.ts      # getComments, postComment...
    vote.ts         # postVote...
    keys.ts         # 쿼리키 정의
```
