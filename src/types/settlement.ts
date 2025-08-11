// 정산 관련 타입 정의
export interface SettlementResponseDto {
    memberId: number;
    performanceTitle: string;
    salesAmount: number;
    refundAmount: number;
    grossAmount: number;
    contractCharge: number;
    commission: number;
    netAmount: number;
    statusName: string;
    settlementDate: string;
    settlementCycle?: string;
}

export interface PagingResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ResultResponse<T> {
    code: string;
    message: string;
    data: T;
}

export enum PeriodType {
    DETAIL = 'DETAIL',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export enum ViewType {
    PERFORMANCE = 'PERFORMANCE',
    HOST = 'HOST'
}

export enum SettlementStatus {
    COMPLETED = 15,    // 정산완료
    PENDING = 14,      // 정산예정
    REFUND_REQUEST = 16 // 환불청구
}

export interface SettlementSearchParams {
    periodType: PeriodType;
    viewType: ViewType;
    settlementCycle?: string;
    startDate?: string;
    endDate?: string;
    performanceTitle?: string;
    statusId?: number;
    page: number;
    size: number;
}



