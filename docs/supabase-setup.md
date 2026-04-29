# Supabase Storage 셋업

게시글/댓글 이미지 업로드를 위한 Supabase Storage 설정 가이드.

## 1. 프로젝트 생성

1. https://supabase.com/dashboard 접속 후 New project
2. Region: **Northeast Asia (Tokyo)** 권장 (Railway `asia-southeast1`과 가까움)
3. DB password는 사용 안 함 (Storage만 쓸 거라 무관)

## 2. 버킷 생성

Storage 메뉴에서 두 개 public 버킷 생성:

### `post-images`
- Public bucket: ✅
- File size limit: **2 MB**
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### `comment-images`
- Public bucket: ✅
- File size limit: **2 MB**
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

## 3. RLS 정책 (선택적, 이중 방어)

서버에서 signed URL을 발급하므로 필수는 아니지만, anon key가 유출됐을 때 임의 경로 업로드를 막기 위한 정책. Storage → 각 버킷 → Policies → New policy.

```sql
-- INSERT 정책: 자기 userId 폴더에만 업로드 가능
-- 단 본 프로젝트는 자체 JWT라 auth.uid()가 비어있어 작동 안 함.
-- 자체 JWT를 Supabase에 매핑하지 않는 한 RLS는 사실상 바이패스됨.
-- 보안은 서버측 signed URL 발급 로직(image-key.util.ts)으로 강제.
```

> 이 프로젝트는 자체 JWT를 쓰고 Supabase Auth와 연동하지 않으므로, 보안 강제는 서버측 `validateImageKeyOwnership` (v20g)에서 처리.

## 4. 키 확보

Project Settings → API:

- **Project URL** → `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`
- **Project API keys → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Project API keys → service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **서버 전용, 절대 프론트 노출 금지**

## 5. 로컬 .env 세팅

### `apps/api/.env.local`
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_POST_BUCKET=post-images
SUPABASE_COMMENT_BUCKET=comment-images
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 6. 프로덕션 (Railway) 환경변수

Railway 대시보드 → Service → Variables 에 위 키들 동일하게 등록:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POST_BUCKET`
- `SUPABASE_COMMENT_BUCKET`

## 7. DB 컬럼 추가 SQL (synchronize 비활성화 시 참고)

현재 `synchronize: true` 라 엔티티만 수정하면 자동 반영되지만, 프로덕션에서 `synchronize: false`로 전환할 때를 대비해 기록:

```sql
ALTER TABLE posts ADD COLUMN images text[] DEFAULT '{}' NOT NULL;
ALTER TABLE comments ADD COLUMN images text[] DEFAULT '{}' NOT NULL;
```

## 8. 동작 확인

1. NestJS 부팅 시 `ConfigService.get('supabase')` 가 정상 객체 반환
2. `POST /api/uploads/sign` 호출 → `{ uploadUrl, token, key, publicUrl }` 응답
3. 프론트에서 `supabase.storage.from(bucket).uploadToSignedUrl(...)` 성공
4. 업로드된 파일은 `https://xxxxx.supabase.co/storage/v1/object/public/{bucket}/{userId}/{yyyy}/{mm}/{uuid}.{ext}` 로 즉시 접근 가능
