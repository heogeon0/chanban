import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 토큰이 있고 유효하면 `request.user`를 주입, 없거나 invalid면 `null`로 통과.
 * 비로그인 호환 라우트에서 사용자 추가 정보(예: 좋아요 여부)를 선택적으로 채울 때 사용.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_err: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
