"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { PostTag, VoteStatus, TAGS } from "@chanban/shared-types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { $getRoot, EditorState } from "lexical";
import { useState } from "react";
import { useCreatePost } from "@/shared/queries";

const TAG_LABELS: Record<PostTag, string> = {
  [PostTag.POLITICS]: "정치",
  [PostTag.SOCIETY]: "사회",
  [PostTag.ECONOMY]: "경제",
  [PostTag.TECHNOLOGY]: "기술",
  [PostTag.ENTERTAINMENT]: "엔터테인먼트",
  [PostTag.SPORTS]: "스포츠",
  [PostTag.OTHER]: "기타",
};

/**
 * 토픽 작성 폼 컴포넌트
 * Lexical editor를 사용하여 토픽을 작성합니다.
 * 제목, 내용, 태그, 글쓴이 의견을 입력받습니다.
 */
export function TopicCreateForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<PostTag>(PostTag.OTHER);
  const [showCreatorOpinion, setShowCreatorOpinion] = useState(false);
  const [creatorOpinion, setCreatorOpinion] = useState<VoteStatus>(VoteStatus.AGREE);

  const { mutate: createPost, isPending } = useCreatePost();

  /**
   * 에디터 상태 변경 시 호출되는 핸들러
   * 에디터의 텍스트 내용을 추출하여 상태를 업데이트합니다.
   */
  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      setContent(textContent);
    });
  };

  /**
   * 폼 제출 핸들러
   * 필수 필드 검증 후 API 호출
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      alert("제목을 입력해주세요");
      return;
    }

    if (trimmedTitle.length > 100) {
      alert("제목은 100자를 초과할 수 없습니다");
      return;
    }

    if (!trimmedContent) {
      alert("내용을 입력해주세요");
      return;
    }

    createPost({
      title: trimmedTitle,
      content: trimmedContent,
      tag,
      showCreatorOpinion,
      creatorOpinion: showCreatorOpinion ? creatorOpinion : undefined,
    });
  };

  const initialConfig = {
    namespace: "TopicEditor",
    theme: {
      paragraph: "mb-1",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    onError: (error: Error) => {
      console.error("Lexical Error:", error);
    },
  };

  const isSubmitDisabled = !title.trim() || !content.trim() || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 태그 선택 */}
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

      {/* 제목 입력 */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-label-default block font-semibold">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="토픽 제목을 입력하세요 (최대 100자)"
          maxLength={100}
          className="w-full px-3 py-2 border border-input rounded-md text-body-default bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="text-caption-default text-muted-foreground text-right">
          {title.length} / 100
        </div>
      </div>

      {/* 내용 입력 (Lexical Editor) */}
      <div className="space-y-2">
        <label className="text-label-default block font-semibold">내용</label>
        <div className="border border-input rounded-md bg-background">
          <LexicalComposer initialConfig={initialConfig}>
            <div className="relative">
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[300px] p-3 focus:outline-none resize-none text-body-default" />
                }
                placeholder={
                  <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none text-body-default">
                    토픽에 대한 설명을 입력하세요...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin onChange={handleEditorChange} />
            </div>
          </LexicalComposer>
        </div>
      </div>

      {/* 글쓴이 의견 공개 옵션 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            id="show-opinion"
            type="checkbox"
            checked={showCreatorOpinion}
            onChange={(e) => setShowCreatorOpinion(e.target.checked)}
            className="w-4 h-4 rounded border-input"
          />
          <label
            htmlFor="show-opinion"
            className="text-body-default cursor-pointer"
          >
            나의 의견 공개하기
          </label>
        </div>

        {showCreatorOpinion && (
          <div className="space-y-2 pl-6">
            <label className="text-label-default block">나의 의견</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCreatorOpinion(VoteStatus.AGREE)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  creatorOpinion === VoteStatus.AGREE
                    ? "border-opinion-agree bg-opinion-agree/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👍</span>
                  <span
                    className={`text-label-default ${
                      creatorOpinion === VoteStatus.AGREE
                        ? "text-opinion-agree font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    찬성
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCreatorOpinion(VoteStatus.NEUTRAL)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  creatorOpinion === VoteStatus.NEUTRAL
                    ? "border-opinion-neutral bg-opinion-neutral/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🤔</span>
                  <span
                    className={`text-label-default ${
                      creatorOpinion === VoteStatus.NEUTRAL
                        ? "text-opinion-neutral font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    중립
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCreatorOpinion(VoteStatus.DISAGREE)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  creatorOpinion === VoteStatus.DISAGREE
                    ? "border-opinion-disagree bg-opinion-disagree/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👎</span>
                  <span
                    className={`text-label-default ${
                      creatorOpinion === VoteStatus.DISAGREE
                        ? "text-opinion-disagree font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    반대
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitDisabled}
      >
        {isPending ? "작성 중..." : "토픽 작성하기"}
      </Button>
    </form>
  );
}
