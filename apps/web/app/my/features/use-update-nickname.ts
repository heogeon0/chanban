import { useAuth } from "@/shared/contexts/auth-context";
import { userMutations } from "@/shared/queries";
import { useMutation } from "@tanstack/react-query";

/**
 * 닉네임 수정 mutation 훅
 * 성공 시 auth context의 user를 즉시 업데이트합니다.
 */
export function useUpdateNickname() {
  const { user, setUser } = useAuth();

  return useMutation({
    mutationFn: userMutations.updateNickname,
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, nickname: data.nickname });
      }
    },
  });
}
