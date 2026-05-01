import type { Metadata } from "next";
import { TopicCreateForm } from "../widgets/topicCreateForm";

export const metadata: Metadata = {
  title: "토픽 작성",
};

export default function CreateTopicPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4">
        <TopicCreateForm />
      </div>
    </div>
  );
}
