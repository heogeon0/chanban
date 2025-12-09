"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  { id: "c1", title: "정치", color: "#f5428d" },
  { id: "c2", title: "사회", color: "#f5a442" },
];

export default function CreateTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("c1");
  const [opinion, setOpinion] = useState<"agree" | "disagree">("agree");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 간단한 검증
    if (!title.trim()) {
      alert("제목을 입력해주세요");
      return;
    }
    if (!description.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    // TODO: API 연동
    console.log({
      title,
      description,
      category,
      opinion,
    });

    // 임시: 토픽 목록으로 이동
    router.push("/topics");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b p-4 flex items-center justify-between">
        <Link
          href="/topics"
          className="text-body-default text-muted-foreground hover:text-foreground"
        >
          ← 취소
        </Link>
        <h1 className="text-title-default">새 토픽 작성</h1>
        <div className="w-12" /> {/* 중앙 정렬용 spacer */}
      </header>

      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-label-default block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategory(cat.id)}
                  asChild
                >
                  <button type="button">{cat.title}</button>
                </Badge>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-label-default block">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="토픽 제목을 입력하세요"
              className="w-full px-3 py-2 border border-input rounded-md text-body-default bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-label-default block">
              내용
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="토픽에 대한 설명을 입력하세요"
              rows={8}
              className="w-full px-3 py-2 border border-input rounded-md text-body-default bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* 의견 선택 */}
          <div className="space-y-2">
            <label className="text-label-default block">나의 의견</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpinion("agree")}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  opinion === "agree"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">👍</span>
                  <span
                    className={`text-label-default ${
                      opinion === "agree"
                        ? "text-blue-600 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    찬성
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOpinion("disagree")}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  opinion === "disagree"
                    ? "border-red-600 bg-red-50 dark:bg-red-950"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">👎</span>
                  <span
                    className={`text-label-default ${
                      opinion === "disagree"
                        ? "text-red-600 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    반대
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" className="w-full" size="lg">
            토픽 작성하기
          </Button>
        </form>
      </main>
    </div>
  );
}
