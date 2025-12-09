"use client";

import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import type { TopicDetail } from "../_controller/types";

// 더미 데이터
const DUMMY_TOPIC: TopicDetail = {
  id: "t1",
  title: "대통령 선거",
  description:
    "대통령 선거에 대한 찬반 토론입니다. 다양한 의견을 나눠주세요.",
  category: "정치",
  approve: 42,
  disagree: 18,
  commentCount: 15,
  creator: {
    id: "u1",
    name: "김철수",
    profileImage: "",
    opinion: "agree",
  },
  createdAt: new Date("2024-12-09"),
  comments: [
    {
      id: "c1",
      content: "이 정책은 정말 필요하다고 생각합니다. 왜냐하면...",
      creator: {
        id: "u2",
        name: "이영희",
        profileImage: "",
        opinion: "agree",
        opinionLog: ["agree"],
      },
      opinion: "agree",
      opinionLog: ["agree"],
      createdAt: new Date("2024-12-09T10:30:00"),
      likeCount: 5,
      replies: [
        {
          id: "c1-1",
          content: "동의합니다. 추가로...",
          creator: {
            id: "u3",
            name: "박민수",
            profileImage: "",
            opinion: "agree",
            opinionLog: ["agree"],
          },
          opinion: "agree",
          opinionLog: ["agree"],
          createdAt: new Date("2024-12-09T11:00:00"),
          likeCount: 2,
          replies: [],
        },
      ],
    },
    {
      id: "c2",
      content: "반대 의견입니다. 이유는...",
      creator: {
        id: "u4",
        name: "최지훈",
        profileImage: "",
        opinion: "disagree",
        opinionLog: ["disagree"],
      },
      opinion: "disagree",
      opinionLog: ["disagree"],
      createdAt: new Date("2024-12-09T12:00:00"),
      likeCount: 3,
      replies: [],
    },
  ],
};

export default function TopicDetailPage() {
  const topic = DUMMY_TOPIC;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b p-4">
        <Link
          href="/topics"
          className="text-body-default text-muted-foreground hover:text-foreground"
        >
          ← 목록으로
        </Link>
      </header>

      <main className="p-4 space-y-6">
        {/* 토픽 정보 */}
        <article className="space-y-4">
          {/* 카테고리 */}
          <div>
            <Badge variant="secondary">{topic.category}</Badge>
          </div>

          {/* 제목 */}
          <h1 className="text-title-lg">{topic.title}</h1>

          {/* 작성자 & 작성일 */}
          <div className="flex items-center gap-2 text-caption-default text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                {topic.creator.name[0]}
              </span>
              <span>{topic.creator.name}</span>
            </span>
            <span>·</span>
            <time>{topic.createdAt.toLocaleDateString()}</time>
            <span>·</span>
            <span
              className={
                topic.creator.opinion === "agree"
                  ? "text-blue-600"
                  : "text-red-600"
              }
            >
              {topic.creator.opinion === "agree" ? "👍 찬성" : "👎 반대"}
            </span>
          </div>

          {/* 내용 */}
          <p className="text-body-default leading-relaxed whitespace-pre-wrap">
            {topic.description}
          </p>

          {/* 동의/반대 통계 */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="찬성" className="text-2xl">
                👍
              </span>
              <div className="flex flex-col">
                <span className="text-caption-default text-muted-foreground">
                  찬성
                </span>
                <span className="text-title-default">{topic.approve}</span>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-2">
              <span role="img" aria-label="반대" className="text-2xl">
                👎
              </span>
              <div className="flex flex-col">
                <span className="text-caption-default text-muted-foreground">
                  반대
                </span>
                <span className="text-title-default">{topic.disagree}</span>
              </div>
            </div>

            <div className="ml-auto text-caption-default text-muted-foreground">
              총 {topic.approve + topic.disagree}명 참여
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="space-y-4">
          <h2 className="text-title-default">
            댓글 {topic.commentCount}개
          </h2>

          <div className="space-y-4">
            {topic.comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* 댓글 */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-caption-default">
                    <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs">
                      {comment.creator.name[0]}
                    </span>
                    <span className="font-medium">{comment.creator.name}</span>
                    <span
                      className={
                        comment.opinion === "agree"
                          ? "text-blue-600"
                          : "text-red-600"
                      }
                    >
                      {comment.opinion === "agree" ? "👍" : "👎"}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <time className="text-muted-foreground">
                      {comment.createdAt.toLocaleString()}
                    </time>
                  </div>

                  <p className="text-body-default">{comment.content}</p>

                  <div className="flex items-center gap-2 text-caption-default text-muted-foreground">
                    <button className="hover:text-foreground">
                      ❤️ {comment.likeCount}
                    </button>
                    <button className="hover:text-foreground">답글</button>
                  </div>
                </div>

                {/* 대댓글 */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 bg-muted/50 rounded-lg space-y-2"
                      >
                        <div className="flex items-center gap-2 text-caption-default">
                          <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs">
                            {reply.creator.name[0]}
                          </span>
                          <span className="font-medium">
                            {reply.creator.name}
                          </span>
                          <span
                            className={
                              reply.opinion === "agree"
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {reply.opinion === "agree" ? "👍" : "👎"}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <time className="text-muted-foreground">
                            {reply.createdAt.toLocaleString()}
                          </time>
                        </div>

                        <p className="text-body-default">{reply.content}</p>

                        <div className="flex items-center gap-2 text-caption-default text-muted-foreground">
                          <button className="hover:text-foreground">
                            ❤️ {reply.likeCount}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
