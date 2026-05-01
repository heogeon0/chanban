import { IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(2, 20)
  nickname: string;
}
