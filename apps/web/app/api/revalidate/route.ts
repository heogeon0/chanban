import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TAGS = new Set(["official-feed"]);

/**
 * 관리자 mutation 흐름에서 호출되는 on-demand revalidation 엔드포인트.
 * Body: `{ tag: string }`. 허용된 태그만 무효화 가능.
 *
 * 호출 측은 같은 origin의 인증된 클라이언트(관리자) — 별도 secret 없이
 * 관리자 권한 검증은 mutation 흐름의 백엔드 가드(RolesGuard)에서 이미 통과한 상태.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const tag = (body as { tag?: unknown })?.tag;
  if (typeof tag !== "string" || !ALLOWED_TAGS.has(tag)) {
    return NextResponse.json({ ok: false, error: "invalid tag" }, { status: 400 });
  }

  // Next.js 16: revalidateTag(tag, profile) — 'max' profile은 모든 캐시 매칭을 무효화한다
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, tag });
}
