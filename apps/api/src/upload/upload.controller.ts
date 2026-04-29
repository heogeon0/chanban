import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { UploadSignResponse } from '@chanban/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { SignUploadDto } from './dto/sign-upload.dto';
import { UploadService } from './upload.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('sign')
  async sign(
    @Body() dto: SignUploadDto,
    @CurrentUser() user: User,
  ): Promise<UploadSignResponse> {
    return this.uploadService.createSignedUploadUrl(user.id, dto);
  }
}
