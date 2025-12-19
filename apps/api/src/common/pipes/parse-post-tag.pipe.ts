import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { PostTag } from '../../entities/enums';

@Injectable()
export class ParsePostTagPipe implements PipeTransform {
  transform(value: string): PostTag {
    const upperValue = value.toUpperCase();

    if (!Object.keys(PostTag).includes(upperValue)) {
      throw new BadRequestException(
        `Invalid tag: ${value}. Available tags: ${Object.values(PostTag).join(', ')}`,
      );
    }

    return PostTag[upperValue as keyof typeof PostTag];
  }
}
