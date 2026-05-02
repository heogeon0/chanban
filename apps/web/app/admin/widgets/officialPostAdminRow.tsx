"use client";

import { Button } from "@/shared/ui/button";
import { PostResponse } from "@chanban/shared-types";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDeleteOfficialPost } from "../features/use-delete-official-post";

const TAG_LABEL: Record<string, string> = {
  politics: "정치",
  society: "사회",
  economy: "경제",
  technology: "기술",
  entertainment: "연예",
  sports: "스포츠",
  other: "기타",
};

interface OfficialPostAdminRowProps {
  post: PostResponse;
}

/**
 * 어드민 공식 토론 목록의 한 행.
 * 제목/본문 미리보기 + 수정/삭제 액션.
 */
export function OfficialPostAdminRow({ post }: OfficialPostAdminRowProps) {
  const { mutate: deletePost, isPending: isDeleting } = useDeleteOfficialPost();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `"${post.title}" 토론을 삭제하시겠습니까?\n삭제하면 되돌릴 수 없습니다.`
    );
    if (!confirmed) return;
    setIsConfirming(true);
    deletePost(post.id, {
      onSettled: () => setIsConfirming(false),
      onError: (error) => {
        console.error("공식 토론 삭제 실패:", error);
        alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      },
    });
  };

  const isBusy = isDeleting || isConfirming;

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
            {TAG_LABEL[post.tag] ?? post.tag}
          </span>
          <span className="text-[11px] text-muted-foreground">
            투표 {post.agreeCount + post.disagreeCount + post.neutralCount} ·
            댓글 {post.commentCount}
          </span>
        </div>
        <Link
          href={`/topics/${post.id}`}
          className="mt-1 block text-[15px] font-semibold text-foreground line-clamp-1 hover:underline"
        >
          {post.title}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {post.content || "본문 없음"}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/posts/${post.id}/edit`}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            수정
          </Link>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isBusy}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          {isBusy ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </article>
  );
}
