import { LoginContent } from "./_components/loginContent";

/**
 * 로그인 페이지 (전체 페이지 버전)
 * URL 직접 접근 또는 새로고침 시 표시됩니다.
 */
export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <LoginContent />
      </div>
    </div>
  );
}
