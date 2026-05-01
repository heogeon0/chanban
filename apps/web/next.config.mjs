/**
 * Supabase Storage public URL 호스트를 next/image remotePatterns에 추가.
 * `https://{ref}.supabase.co/storage/v1/object/public/...` 형태의 이미지를 next/image로 로드할 때 필요.
 * (현재는 일반 <img> 태그로 렌더링하므로 즉시 영향은 없으나, 추후 next/image 전환 대비)
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
