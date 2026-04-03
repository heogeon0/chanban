"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/**
 * 검색 입력 바 컴포넌트
 * 현재 텍스트 검색은 미지원으로 포커스 시 카테고리 탐색 안내를 표시합니다.
 */
export function SearchBar() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    // 텍스트 검색 API 미지원 — 추후 연동 예정
  };

  const handleCancelClick = () => {
    setValue("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div
        className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-colors ${
          isFocused
            ? "bg-card border border-primary/40 ring-2 ring-primary/10"
            : "bg-muted border border-transparent"
        }`}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors ${
            isFocused ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="토픽 검색"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isFocused && (
        <button
          type="button"
          onMouseDown={handleCancelClick}
          className="text-[14px] font-medium text-muted-foreground shrink-0"
        >
          취소
        </button>
      )}
    </form>
  );
}
