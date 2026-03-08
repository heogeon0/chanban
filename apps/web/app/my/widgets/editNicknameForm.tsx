'use client';

import { Button } from '@/shared/ui/button';
import { useRef } from 'react';
import { useUpdateNickname } from '../features/use-update-nickname';

interface EditNicknameFormProps {
  currentNickname: string;
  onClose: () => void;
}

/**
 * 인라인 닉네임 수정 폼
 * 입력 후 확인 버튼으로 저장하거나 취소할 수 있습니다.
 */
export function EditNicknameForm({ currentNickname, onClose }: EditNicknameFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateNickname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nickname = inputRef.current?.value.trim();
    if (!nickname || nickname === currentNickname) {
      onClose();
      return;
    }
    mutate({ nickname }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        defaultValue={currentNickname}
        minLength={2}
        maxLength={20}
        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? '저장 중...' : '확인'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onClose}>
        취소
      </Button>
    </form>
  );
}
