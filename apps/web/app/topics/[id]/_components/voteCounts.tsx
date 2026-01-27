"use client";

import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { VoteProgressBar } from "@/shared/ui/voteProgressBar";
import { useGetVoteCount } from "../_queries/useGetVoteCount";

interface VoteCountsProps {
  postId: string;
}

/**
 * 게시물의 투표 통계를 표시하는 컴포넌트
 * useQuery를 활용하여 실시간으로 투표 수를 조회합니다.
 *
 * @param postId - 게시물 ID
 */
export function VoteCounts({ postId }: VoteCountsProps) {
  const { data: voteCount, isLoading } = useGetVoteCount(postId);

  console.log(voteCount, 'voteCount');

  if (isLoading || !voteCount) {
    return (
      <section className="space-y-3">
        <h4 className="text-title-default">투표 집계 중...</h4>
        <div className="bg-card border rounded-lg p-4 animate-pulse">
          <div className="h-32 bg-muted rounded" />
        </div>
      </section>
    );
  }

  const totalVotes =
    voteCount.agreeCount + voteCount.disagreeCount + voteCount.neutralCount;

  return (
    <section className="space-y-3">
      <h4 className="text-title-default">총 {totalVotes}명 참여</h4>
      {/* 동의/반대/중립 통계 카드 */}
      <div className="bg-card border rounded-lg p-4 relative">
        <VoteProgressBar
          agreeCount={voteCount.agreeCount}
          disagreeCount={voteCount.disagreeCount}
          height="100%"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ChanIcon size={32} className="text-opinion-agree" />

            <div className="flex flex-col">
              <span className="text-caption-default text-muted-foreground">
                찬성
              </span>
              <span className="text-title-default font-semibold">
                {voteCount.agreeCount}
              </span>
            </div>
          </div>

          <div className="w-px h-12 bg-border" />

          <div className="flex items-center gap-3">
            <ChongIcon size={32} className="text-opinion-neutral" />
            <div className="flex flex-col">
              <span className="text-caption-default text-muted-foreground">
                중립
              </span>
              <span className="text-title-default font-semibold">
                {voteCount.neutralCount}
              </span>
            </div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="flex items-center gap-3">
            <BanIcon size={32} className="text-opinion-disagree" />
            <div className="flex flex-col">
              <span className="text-caption-default text-muted-foreground">
                반대
              </span>
              <span className="text-title-default font-semibold">
                {voteCount.disagreeCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
