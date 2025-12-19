export interface ApiResponse<T> {
  data: T;
  meta?: any;
}

export class ResponseWithMeta<T, M = any> {
  data: T;
  meta: M;

  constructor(data: T, meta: M) {
    this.data = data;
    this.meta = meta;
  }
}
