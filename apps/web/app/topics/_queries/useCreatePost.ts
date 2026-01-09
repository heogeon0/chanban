import { httpClient } from "@/lib/httpClient";
import { ApiResponse, PostTag, VoteStatus } from "@chanban/shared-types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface CreatePostDto {
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion?: boolean;
  creatorOpinion?: VoteStatus;
}

interface PostResponse {
  id: string;
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion: boolean;
  creatorOpinion: VoteStatus | null;
  createdAt: Date;
}

/**
 * 글 작성 mutation 훅
 * 토픽을 생성하고 성공 시 해당 토픽 상세 페이지로 이동합니다.
 *
 * @returns UseMutationResult<PostResponse, Error, CreatePostDto>
 *
 * @example
 * const { mutate: createPost, isPending } = useCreatePost();
 *
 * createPost({
 *   title: "토픽 제목",
 *   content: "토픽 내용",
 *   tag: PostTag.POLITICS,
 *   showCreatorOpinion: true,
 *   creatorOpinion: VoteStatus.AGREE
 * });
 */
export function useCreatePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (createPostDto: CreatePostDto) => {
      return await httpClient.post<ApiResponse<PostResponse>, CreatePostDto>(
        "/api/posts/create",
        createPostDto
      );
    },
    onSuccess: (data) => {
      // 생성된 토픽 상세 페이지로 이동
      router.push(`/topics/${data.data.id}`);
    },
  });
}
