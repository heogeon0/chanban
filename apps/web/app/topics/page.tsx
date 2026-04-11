import { redirect } from "next/navigation";
import { PostTag } from "@chanban/shared-types";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(params as Record<string, string>).toString();
  redirect(query ? `/?${query}` : "/");
}
