import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UploadSignResponse } from '@chanban/shared-types';
import { SupabaseConfig } from '../config/supabase.config';
import { buildImageKey } from '../common/utils/image-key.util';
import { SignUploadDto } from './dto/sign-upload.dto';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private supabase: SupabaseClient | null = null;
  private config!: SupabaseConfig;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get<SupabaseConfig>('supabase');
    if (!config || !config.url || !config.serviceRoleKey) {
      this.logger.warn(
        'Supabase config가 비어있습니다. 이미지 업로드 기능이 비활성화됩니다.',
      );
      return;
    }
    this.config = config;
    this.supabase = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  /**
   * Supabase Storage에 직접 업로드할 signed upload URL을 생성한다.
   * key는 `{userId}/{yyyy}/{mm}/{uuid}.{ext}` 형식으로 강제되어 다른 유저 폴더 침범 불가.
   */
  async createSignedUploadUrl(
    userId: string,
    dto: SignUploadDto,
  ): Promise<UploadSignResponse> {
    if (!this.supabase || !this.config) {
      throw new InternalServerErrorException('Supabase storage 미설정');
    }

    const bucket =
      dto.scope === 'post'
        ? this.config.postBucket
        : this.config.commentBucket;
    const key = buildImageKey(userId, dto.mimeType);

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(key);

    if (error || !data) {
      this.logger.error(
        `signed upload URL 생성 실패: ${error?.message ?? 'unknown'}`,
      );
      throw new BadRequestException('업로드 URL 생성 실패');
    }

    const { data: publicData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(key);

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      key,
      publicUrl: publicData.publicUrl,
    };
  }
}
