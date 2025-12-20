export enum ErrorCode {
  // Post 관련
  INVALID_POST_TAG = 'INVALID_POST_TAG',
  POST_NOT_FOUND = 'POST_NOT_FOUND',

  // Comment 관련
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  INVALID_COMMENT_NESTING = 'INVALID_COMMENT_NESTING',

  // Common
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface ErrorMetadata {
  message: string;
  status: number;
}

export const ERROR_METADATA: Record<ErrorCode, ErrorMetadata> = {
  // Post 관련
  [ErrorCode.INVALID_POST_TAG]: {
    message: '유효하지 않은 태그입니다',
    status: 400,
  },
  [ErrorCode.POST_NOT_FOUND]: {
    message: '포스트를 찾을 수 없습니다',
    status: 404,
  },

  // Comment 관련
  [ErrorCode.COMMENT_NOT_FOUND]: {
    message: '댓글을 찾을 수 없습니다',
    status: 404,
  },
  [ErrorCode.INVALID_COMMENT_NESTING]: {
    message: '답글에는 답글을 작성할 수 없습니다',
    status: 400,
  },

  // Common
  [ErrorCode.BAD_REQUEST]: {
    message: '잘못된 요청입니다',
    status: 400,
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: '인증이 필요합니다',
    status: 401,
  },
  [ErrorCode.FORBIDDEN]: {
    message: '접근 권한이 없습니다',
    status: 403,
  },
  [ErrorCode.NOT_FOUND]: {
    message: '요청한 리소스를 찾을 수 없습니다',
    status: 404,
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    message: '서버 오류가 발생했습니다',
    status: 500,
  },
};

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}
