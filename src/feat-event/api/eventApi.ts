import api from '../../services/api';

// 이벤트 타입 정의
export enum EventType {
  COUPON = 'COUPON',
  TICKET = 'TICKET'
}

// 쿠폰 응답 DTO
export interface CouponListResponseDto {
  id: number;
  name: string;
  rate: number;
  eventId: number;
}

// 페이징 응답 DTO
export interface PagingResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

// 이벤트 목록 응답 DTO
export interface EventListResponseDto {
  eventId: number;
  name: string;
}

// API 응답 래퍼
export interface ResultResponse<T> {
  status: number;
  message: string;
  data: T;
}

// 쿠폰 이벤트 전체 조회 (페이징)
export const getCouponEvents = async (page: number = 0, size: number = 10) => {
  const params = {
    type: EventType.COUPON,
    page: page,
    size: size
  };
  
  console.log('쿠폰 이벤트 요청 파라미터:', params);
  console.log('EventType.COUPON 값:', EventType.COUPON);
  
  const res = await api.get<ResultResponse<PagingResponse<CouponListResponseDto>>>('/api/v1/event', {
    params: params
  });
  return res.data.data;
};

// 티켓 이벤트 전체 조회 (페이징)
export const getTicketEvents = async (page: number = 0, size: number = 10) => {
  const params = {
    type: EventType.TICKET,
    page: page,
    size: size
  };
  
  console.log('티켓 이벤트 요청 파라미터:', params);
  console.log('EventType.TICKET 값:', EventType.TICKET);
  
  const res = await api.get<ResultResponse<PagingResponse<EventListResponseDto>>>('/api/v1/event', {
    params: params
  });
  return res.data.data;
};

// 특정 이벤트 응모
export const participateEvent = async (eventId: number) => {
  const res = await api.post(`/api/v1/event/ticket/${eventId}`);
  return res.data;
};

// 쿠폰 발급
export const issueCoupon = async (eventId: number) => {
  const res = await api.post(`/api/v1/event/coupon/${eventId}`);
  return res.data;
};

// 특별 이벤트 쿠폰 조회 (coupon_id: 2, 3, 4)
export const getSpecialEventCoupons = async () => {
  const specialCouponIds = [1, 2, 3];
  const promises = specialCouponIds.map(id => 
    api.get<ResultResponse<CouponListResponseDto>>(`/api/v1/event/coupon/${id}`)
  );
  try {
    const responses = await Promise.all(promises);
    return responses.map(res => res.data.data);
  } catch (error) {
    console.error('특별 이벤트 쿠폰 조회 실패:', error);
    // API 실패 시 기본 데이터 반환
    return [
      { id: 2, name: "뮤지컬 〈프리다〉", rate: 15, eventId: 2 },
      { id: 3, name: "콘서트 〈스프링 페스티벌〉", rate: 25, eventId: 3 },
      { id: 4, name: "연극 〈햄릿〉", rate: 20, eventId: 4 }
    ];
  }
};

// 이벤트 목록 조회 (범용)
export const getEventList = async (eventType: EventType, page: number = 0, size: number = 10) => {
  const res = await api.get<ResultResponse<PagingResponse<EventListResponseDto>>>('/api/v1/event', {
    params: {
      type: eventType,
      page: page,
      size: size
    }
  });
  return res.data.data;
}; 