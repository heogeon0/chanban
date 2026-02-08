import { SignupContent } from "./widgets/signupContent";

/**
 * 회원가입 페이지 (전체 페이지 버전)
 * URL 직접 접근 또는 새로고침 시 표시됩니다.
 */
export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <SignupContent />
      </div>
    </div>
  );
}
