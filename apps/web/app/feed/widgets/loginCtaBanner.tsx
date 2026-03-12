import { KakaoLoginButton } from "@/shared/components/kakao-login-button";

/**
 * 비로그인 사용자 대상 로그인 유도 배너
 */
export function LoginCtaBanner() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 desktop:p-8 text-center">
      <p className="text-2xl mb-2">🗳</p>
      <h3 className="text-lg font-bold mb-1">내 의견을 남겨보세요</h3>
      <p className="text-sm text-muted-foreground mb-6">
        로그인하면 토론에 참여하고 나만의 피드를 볼 수 있어요.
      </p>
      <div className="max-w-xs mx-auto">
        <KakaoLoginButton />
      </div>
    </section>
  );
}
