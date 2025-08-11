// types/paging.d.ts
export type PagingResponse<T> = {
  content: T[];
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number; // ✅ 총 페이지 수
  isLast: boolean; // ✅ 마지막 페이지 여부
};

export type CouponResponseDto = {
  couponId: number;
  couponName: string;
  couponRate: number; // short -> number
  couponValid: string; // Instant -> ISO string
};

export type ApiResponse<T> = { data: T };
