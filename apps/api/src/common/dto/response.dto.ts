import type { ApiResponse } from '@chanban/shared-types';

export type { ApiResponse };

export class ResponseWithMeta<T, M = any> {
  data: T;
  meta: M;

  constructor(data: T, meta: M) {
    this.data = data;
    this.meta = meta;
  }
}
