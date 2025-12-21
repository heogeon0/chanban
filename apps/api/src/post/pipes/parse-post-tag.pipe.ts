import { ErrorCode, PostTag } from '@chanban/shared-types';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePostTagPipe implements PipeTransform {
  transform(value: string): PostTag {
    const upperValue = value.toUpperCase();

    if (!Object.keys(PostTag).includes(upperValue)) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_POST_TAG,
      });
    }

    return PostTag[upperValue as keyof typeof PostTag];
  }
}
