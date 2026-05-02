"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { PostResponse, PostTag, TAGS } from "@chanban/shared-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateOfficialPost } from "../features/use-update-official-post";

const TAG_LABELS: Record<PostTag, string> = {
  [PostTag.POLITICS]: "정치",
  [PostTag.SOCIETY]: "사회",
  [PostTag.ECONOMY]: "경제",
  [PostTag.TECHNOLOGY]: "기술",
  [PostTag.ENTERTAINMENT]: "엔터테인먼트",
  [PostTag.SPORTS]: "스포츠",
  [PostTag.OTHER]: "기타",
};

const TITLE_MAX_LENGTH = 100;

interface OfficialPostEditFormProps {
  post: PostResponse;
}

/**
 * 공식 토론 수정 폼.
 * 작성 폼(`TopicCreateForm`)과 같은 입력 필드를 갖되, 초기값으로 기존 게시물을 채운다.
 * 수정은 Lexical 상태 초기화 복잡성을 피하기 위해 textarea를 사용.
 */
export function OfficialPostEditForm({ post }: OfficialPostEditFormProps) {
  const router = useRouter();
  const { mutate: updatePost, isPending } = useUpdateOfficialPost();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tag, setTag] = useState<PostTag>(post.tag);
  const [showCreatorOpinion, setShowCreatorOpinion] = useState(
    post.showCreatorOpinion
  );

  /**
   * 폼 제출 핸들러
   * 필수 필드 검증 후 update mutation 실행.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      alert("제목을 입력해주세요");
      return;
    }
    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      alert(`제목은 ${TITLE_MAX_LENGTH}자를 초과할 수 없습니다`);
      return;
    }
    if (!trimmedContent) {
      alert("내용을 입력해주세요");
      return;
    }

    updatePost(
      {
        id: post.id,
        data: {
          title: trimmedTitle,
          content: trimmedContent,
          tag,
          showCreatorOpinion,
        },
      },
      {
        onSuccess: () => {
          router.push("/admin/posts");
        },
        onError: (error) => {
          console.error("공식 토론 수정 실패:", error);
          alert("수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
        },
      }
    );
  };

  const isSubmitDisabled = !title.trim() || !content.trim() || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 카테고리 */}
      <div className="space-y-2">
        <label className="text-label-default block font-semibold">
          카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tagOption) => (
            <Badge
              key={tagOption}
              variant={tag === tagOption ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTag(tagOption)}
              asChild
            >
              <button type="button">{TAG_LABELS[tagOption]}</button>
            </Badge>
          ))}
        </div>
      </div>

      {/* 제목 */}
      <div className="space-y-2">
        <label htmlFor="edit-title" className="text-label-default block font-semibold">
          제목
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="토픽 제목을 입력하세요 (최대 100자)"
          maxLength={TITLE_MAX_LENGTH}
          className="w-full px-3 py-2 border border-input rounded-md text-body-default bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="text-caption-default text-muted-foreground text-right">
          {title.length} / {TITLE_MAX_LENGTH}
        </div>
      </div>

      {/* 내용 */}
      <div className="space-y-2">
        <label htmlFor="edit-content" className="text-label-default block font-semibold">
          내용
        </label>
        <textarea
          id="edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="토픽에 대한 설명을 입력하세요..."
          className="w-full min-h-[300px] px-3 py-2 border border-input rounded-md text-body-default bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      {/* 글쓴이 의견 공개 */}
      <div className="flex items-center gap-2">
        <input
          id="edit-show-opinion"
          type="checkbox"
          checked={showCreatorOpinion}
          onChange={(e) => setShowCreatorOpinion(e.target.checked)}
          className="w-4 h-4 rounded border-input"
        />
        <label
          htmlFor="edit-show-opinion"
          className="text-body-default cursor-pointer"
        >
          나의 의견 공개하기
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          size="lg"
          onClick={() => router.push("/admin/posts")}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={isSubmitDisabled}
        >
          {isPending ? "저장 중..." : "수정 저장"}
        </Button>
      </div>
    </form>
  );
}
