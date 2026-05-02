"use client";

import { Button } from "@/shared/ui/button";
import { topicQueries } from "@/shared/queries";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { OfficialPostEditForm } from "../../../widgets/officialPostEditForm";

/**
 * 공식 토론 수정 페이지.
 * URL params에서 id를 받아 기존 게시물을 fetch한 뒤 폼에 초기값으로 채운다.
 */
export default function AdminEditOfficialPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id ?? "";

  const { data, isLoading, isError, refetch } = useQuery({
    ...topicQueries.detail(postId),
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          게시물을 불러오지 못했습니다.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/admin/posts")}
          >
            목록으로
          </Button>
        </div>
      </div>
    );
  }

  if (!data.isOfficial) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          공식 토론이 아닌 게시물은 어드민에서 수정할 수 없습니다.
        </p>
        <Button size="sm" onClick={() => router.push("/admin/posts")}>
          목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight">공식 토론 수정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          기존 내용을 수정한 뒤 저장하면 메인 피드에 즉시 반영됩니다.
        </p>
      </header>

      <OfficialPostEditForm post={data} />
    </div>
  );
}
