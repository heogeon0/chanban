import { VoteStatus } from '@chanban/shared-types';

type FilterValue = VoteStatus | 'all';

interface VoteFilterProps {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  counts: {
    all: number;
    agree: number;
    disagree: number;
  };
}

const FILTER_OPTIONS: { id: FilterValue; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: VoteStatus.AGREE, label: '찬성' },
  { id: VoteStatus.DISAGREE, label: '반대' },
];

/**
 * 투표 필터 칩 — 전체/찬성/반대 pill 버튼
 */
export function VoteFilter({ value, onChange, counts }: VoteFilterProps) {
  const getCount = (id: FilterValue) => {
    if (id === 'all') return counts.all;
    if (id === VoteStatus.AGREE) return counts.agree;
    return counts.disagree;
  };

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label} {getCount(option.id)}
          </button>
        );
      })}
    </nav>
  );
}
