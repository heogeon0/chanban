import { registerAs } from '@nestjs/config';

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
  postBucket: string;
  commentBucket: string;
}

export default registerAs(
  'supabase',
  (): SupabaseConfig => ({
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    postBucket: process.env.SUPABASE_POST_BUCKET || 'post-images',
    commentBucket: process.env.SUPABASE_COMMENT_BUCKET || 'comment-images',
  }),
);
