export interface FollowStatusResponse {
  isFollowing: boolean;
}

export interface FollowCountsResponse {
  followersCount: number;
  followingCount: number;
}

export interface FollowUserResponse {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}
