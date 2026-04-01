import { httpClient } from "@/lib/httpClient";
import { ApiResponse, PaginatedResponse, PostResponse, UserResponse } from "@chanban/shared-types";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProfileHeader } from "./widgets/profile-header";
import { UserProfileTabs } from "./widgets/user-profile-tabs";

const getUser = cache(async (id: string): Promise<UserResponse | null> => {
  try {
    const response = await httpClient.get<ApiResponse<UserResponse>>(
      `/api/users/${id}/profile`
    );
    return response.data;
  } catch {
    return null;
  }
});

const getUserTopicsCount = cache(async (id: string): Promise<number> => {
  try {
    const response = await httpClient.get<PaginatedResponse<PostResponse>>(
      `/api/users/${id}/posts?page=1&limit=1`
    );
    return response.meta.total;
  } catch {
    return 0;
  }
});

export default async function UserProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [user, totalTopics] = await Promise.all([
    getUser(id),
    getUserTopicsCount(id),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-[840px] mx-auto px-6 py-8">
      <ProfileHeader user={user} totalTopics={totalTopics} />
      <UserProfileTabs userId={id} />
    </div>
  );
}
