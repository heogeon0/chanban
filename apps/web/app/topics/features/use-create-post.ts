import { topicMutations, CreatePostDto } from "@/shared/queries";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * 글 작성 mutation 훅
 * 토픽을 생성하고 성공 시 해당 토픽 상세 페이지로 이동합니다.
 */
export function useCreatePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: topicMutations.create,
    onSuccess: (data) => {
      router.push(`/topics/${data.data.id}`);
    },
  });
}
