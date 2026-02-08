
import { TopicCreateForm } from "../widgets/topicCreateForm";

/**
 * 토픽 작성 페이지
 * 새로운 토픽을 작성하는 페이지입니다.
 */
export default function CreateTopicPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 메인 콘텐츠 */}
      <main className="max-w-3xl mx-auto p-4">
        <TopicCreateForm />
      </main>
    </div>
  );
}
