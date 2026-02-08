import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function TopicNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black">404</h1>
        <p className="text-muted-foreground text-lg">
          존재하지 않는 토론입니다.
        </p>
        <Button asChild>
          <Link href="/topics">목록으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
