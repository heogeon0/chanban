"use client";

import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SearchType = "all" | "author" | "content";

const SEARCH_TYPES: { type: SearchType; label: string; description: string }[] = [
  { type: "all",     label: "전체 검색",   description: "제목, 내용, 작성자를 모두 검색" },
  { type: "content", label: "내용 검색",   description: "제목과 본문에서 검색" },
  { type: "author",  label: "작성자 검색", description: "닉네임으로 작성자 검색" },
];

interface SearchBarProps {
  onQueryChange: (query: string, searchType: SearchType) => void;
}

/**
 * 검색 입력 바 컴포넌트
 * - 포커스 시 검색 범위 드롭다운 표시 (전체/내용/작성자)
 * - debounce(300ms) 적용 후 onQueryChange 호출
 * - 입력 중 Loader2 스피너 표시
 */
export function SearchBar({ onQueryChange }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [isPending, setIsPending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setIsPending(false);
      onQueryChange("", searchType);
      return;
    }

    setIsPending(true);
    debounceRef.current = setTimeout(() => {
      setIsPending(false);
      onQueryChange(value.trim(), searchType);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, searchType, onQueryChange]);

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const handleCancelClick = () => {
    setValue("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelectType = (type: SearchType) => {
    setSearchType(type);
    inputRef.current?.focus();
  };

  const showSpinner = isPending && value.trim().length > 0;
  const selectedLabel = SEARCH_TYPES.find((s) => s.type === searchType)!.label;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        {/* 입력 바 */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-colors ${
            isFocused
              ? "bg-card border border-primary/40 ring-2 ring-primary/10"
              : "bg-muted border border-transparent"
          }`}
        >
          {showSpinner ? (
            <Loader2 className="w-4 h-4 shrink-0 text-primary animate-spin" />
          ) : (
            <Search
              className={`w-4 h-4 shrink-0 transition-colors ${
                isFocused ? "text-primary" : "text-muted-foreground"
              }`}
            />
          )}
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
          {/* 선택된 검색 범위 칩 */}
          {value && (
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              {selectedLabel}
            </span>
          )}
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

        {/* 검색 범위 드롭다운 */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            {SEARCH_TYPES.map(({ type, label, description }) => (
              <button
                key={type}
                type="button"
                onMouseDown={() => handleSelectType(type)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                  searchType === type ? "bg-primary/5" : ""
                }`}
              >
                <div>
                  <p className={`text-[13px] font-semibold ${searchType === type ? "text-primary" : ""}`}>
                    {label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </div>
                {searchType === type && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
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
    </div>
  );
}
