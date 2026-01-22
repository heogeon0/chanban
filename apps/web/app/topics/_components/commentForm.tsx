"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { Button } from "@workspace/ui/components/button";
import { $getRoot, EditorState } from "lexical";
import { useState, useEffect } from "react";
import { usePostComment } from "../_queries/usePostComment";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface CommentFormProps {
  topicId: string;
  parentId?: string;
  onSubmit?: (content: string) => void;
}

/**
 * 에디터 초기화를 위한 플러그인 컴포넌트
 */
function ClearEditorPlugin({ clearTrigger }: { clearTrigger: number }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (clearTrigger > 0) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
      });
    }
  }, [clearTrigger, editor]);

  return null;
}

/**
 * Lexical editor를 사용한 댓글 작성 폼 컴포넌트
 *
 * @param topicId - 댓글이 작성될 토픽의 ID
 * @param parentId - 대댓글인 경우 부모 댓글 ID
 * @param onSubmit - 댓글 제출 시 호출될 콜백 함수
 */
export function CommentForm({
  topicId,
  parentId,
  onSubmit,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);
  const { mutate: postComment, isPending } = usePostComment();

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
   * 댓글 제출 핸들러
   * 빈 댓글은 제출하지 않습니다.
   */
  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    postComment(
      {
        content: trimmedContent,
        postId: topicId,
        parentId,
      },
      {
        onSuccess: () => {
          // 제출 성공 시 에디터 초기화
          setClearTrigger((prev) => prev + 1);
          setContent("");
          onSubmit?.(trimmedContent);
        },
        onError: (error) => {
          console.error("Failed to submit comment:", error);
        },
      }
    );
  };

  const initialConfig = {
    namespace: "CommentEditor",
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

  const isSubmitDisabled = !content.trim() || isPending;

  return (
    <div className="space-y-3">
      {/* 에디터 영역 */}
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <PlainTextPlugin
            contentEditable={
              <ContentEditable className="w-full bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm p-4 min-h-[100px] focus:outline-none transition-colors" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none text-sm">
                토론에 참여해보세요...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          <ClearEditorPlugin clearTrigger={clearTrigger} />
        </div>
      </LexicalComposer>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="px-6 font-bold"
        >
          {isPending ? "작성 중..." : "댓글 작성"}
        </Button>
      </div>
    </div>
  );
}
