"use client";

import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const DUMMY_CATEGORIES = [
  { id: "c1", title: "정치", color: "#f5428d" },
  { id: "c2", title: "사회", color: "#f5a442" },
];

const DUMMY_TOPICS = {
  c1: [
    {
      id: "t1",
      title: "대통령 선거",
      description: "대통령 선거 토픽",
      approve: 4,
      reject: 1,
      commentCount: 10,
      creator: "user1",
      createdAt: new Date(),
    },
    {
      id: "t2",
      title: "국회 의원 선거",
      description: "국회 의원 선거 토픽",
      approve: 3,
      reject: 2,
      commentCount: 10,
      creator: "user2",
      createdAt: new Date(),
    },
    {
      id: "t3",
      title: "시도지사 선거",
      description: "시도지사 선거 토픽",
      approve: 2,
      reject: 3,
      commentCount: 10,
      creator: "user3",
      createdAt: new Date(),
    },
    {
      id: "t4",
      title: "시군구의회 의원 선거",
      description: "시군구의회 의원 선거 토픽",
      approve: 1,
      reject: 4,
      commentCount: 10,
      creator: "user4",
      createdAt: new Date(),
    },
    {
      id: "t5",
      title: "시장 선거",
      description: "시장 선거 토픽",
      approve: 0,
      reject: 5,
      commentCount: 10,
      creator: "user5",
      createdAt: new Date(),
    },
    {
      id: "t6",
      title: "교육 정책",
      description: "교육 정책 토픽",
      approve: 0,
      reject: 6,
      commentCount: 10,
      creator: "user6",
      createdAt: new Date(),
    },
  ],
  c2: [
    {
      id: "t1",
      title: "위치",
      description: "위치 토픽",
      approve: 4,
      reject: 1,
      commentCount: 10,
      creator: "user1",
      createdAt: new Date(),
    },
    {
      id: "t2",
      title: "소득",
      description: "소득 토픽",
      approve: 3,
      reject: 2,
      commentCount: 10,
      creator: "user2",
      createdAt: new Date(),
    },
    {
      id: "t3",
      title: "교육",
      description: "교육 토픽",
      approve: 2,
      reject: 3,
      commentCount: 10,
      creator: "user3",
      createdAt: new Date(),
    },
    {
      id: "t4",
      title: "복지",
      description: "복지 토픽",
      approve: 1,
      reject: 4,
      commentCount: 10,
      creator: "user4",
      createdAt: new Date(),
    },
    {
      id: "t5",
      title: "보건",
      description: "보건 토픽",
      approve: 0,
      reject: 5,
      commentCount: 10,
      creator: "user5",
      createdAt: new Date(),
    },
    {
      id: "t6",
      title: "환경",
      description: "환경 토픽",
      approve: 0,
      reject: 6,
      commentCount: 10,
      creator: "user6",
      createdAt: new Date(),
    },
  ],
};

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const categoryId =
    (searchParams.get("category") as keyof typeof DUMMY_TOPICS) || "c1";

  return (
    <div>
      <header>
        <ul className="flex flex-wrap gap-x-2 border-b py-4">
          {DUMMY_CATEGORIES.map((category, index) => (
            <li key={category.id} aria-label={`${index + 1}번째 카테고리`}>
              <Badge asChild>
                <Link href={`/topics?category=${category.id}`}>
                  {category.title}
                </Link>
              </Badge>
            </li>
          ))}
        </ul>
      </header>
      <main className="bg-green-50">
        <ul className="flex flex-wrap gap-x-2 flex-col gap-y-1">
          {DUMMY_TOPICS[categoryId].map((topic, index) => (
            <li key={topic.id} aria-label={`${index + 1}번째 토픽`}>
              <Link
                href={`/topics/${topic.id}`}
                className="relative block p-4 bg-white"
              >
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <h1 aria-label="토픽 제목" className="text-title-default">
                      {topic.title}
                    </h1>
                    <p
                      aria-label="토픽 설명"
                      className="text-body-default truncate"
                    >
                      {topic.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-caption-default text-muted-foreground gap-0.5">
                    <span className="작성일">
                      {topic.createdAt.toLocaleDateString()}
                    </span>
                    <span className="작성자">{topic.creator}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-x-1 mt-2">
                    <div className="flex items-center gap-x-1">
                      <span role="img" aria-label="찬성">
                        👍
                      </span>
                      <span
                        aria-label="찬성 수"
                        className="text-caption-default"
                      >
                        {topic.approve}
                      </span>
                    </div>

                    <div className="flex items-center gap-x-1">
                      <span role="img" aria-label="반대">
                        👎
                      </span>
                      <span
                        aria-label="찬성 수"
                        className="text-caption-default"
                      >
                        {topic.reject}
                      </span>
                    </div>

                    <div className="flex items-center gap-x-1">
                      <span role="img" aria-label="댓글 수">
                        💬
                      </span>
                      <span
                        aria-label="찬성 수"
                        className="text-caption-default"
                      >
                        {topic.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
