import { IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty({ message: '임시 토큰이 필요합니다.' })
  @IsString()
  tempToken: string;

  @IsNotEmpty({ message: '닉네임이 필요합니다.' })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  nickname: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
