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
  validDate?: string; // 백엔드와 일치하도록 추가
}

// 티켓 응답 DTO
export interface TicketListResponseDto {
  eventId: number;
  name: string;
  perPrice: number;
  img: string;
  startDate: string;
  endDate: string;
  statusName?: string; // 이벤트 상태명 (예정, 진행중, 마감)
  statusId?: number; // 이벤트 상태 ID
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

// 티켓 이벤트 상세 조회 응답 DTO
export interface TicketEventDetailResponseDto {
    id: number;
    performanceTitle: string;
    performancePlace: string;
    performanceRuntime: number;
    performanceDate: string;
    seatNumber: string;
    seatGrade: string;
    perPrice: number;
    performanceImg: string;
    eventStatusName: string;
    statusId?: number; // 이벤트 상태 ID (6: 종료된 이벤트)
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


export interface TicketApplyResponseDto{
    eventId: number;
    memberId: number;
    isWinner: boolean;
    message: string;
}

// 랜덤 이벤트 응답 타입
export interface RandomEventResponseDto {
  eventId: number;
  performanceId: number;
  eventName: string;
  seatNumber: string;
  startDate: string;
  endDate: string;
}

// 공연 상세 정보 응답 타입
export interface PerformanceDetailResponseDto {
  performanceId: number;
  title: string;
  img: string;
  date: string;
  runtime: number;
  price: string;
  hallAddress: string;
  hostBizName: string;
  startDate: string;
  endDate: string;
  statusDescription: string;
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
  
  const res = await api.get<ResultResponse<PagingResponse<TicketListResponseDto>>>('/api/v1/event', {
    params: params
  });
  return res.data.data;
};

// 티켓 이벤트 검색 (키워드 검색)
export const searchTicketEvents = async (keyword: string, page: number = 0, size: number = 12) => {
  const params = {
    keyword: keyword,
    page: page,
    size: size
  };
  
  console.log('티켓 이벤트 검색 요청 파라미터:', params);
  
  const res = await api.get<ResultResponse<PagingResponse<TicketListResponseDto>>>('/api/v1/event/ticket/search', {
    params: params
  });
  return res.data.data;
};

export const getTicketEventDetail = async (eventId: number) => {
    const res = await api.get<ResultResponse<TicketEventDetailResponseDto>>(`/api/v1/event/ticket/${eventId}`);
    return res.data.data;
};

// 

// 특정 이벤트 응모
export const applyTicketEvent = async (eventId: number) => {
  const res = await api.post<ResultResponse<TicketApplyResponseDto>>(`/api/v1/event/ticket/${eventId}`);
  return res.data.data;
};

// 쿠폰 발급
export const issueCoupon = async (eventId: number) => {
  const res = await api.post(`/api/v1/event/coupon/${eventId}`);
  return res.data;
};

// 쿠폰 발급 API
export const issueEventCoupon = async (eventId: number): Promise<{ status: number; message: string; data: string }> => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 토큰이 있으면 인증 헤더 추가
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:8081/api/v1/event/coupon/${eventId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('쿠폰 발급 실패:', error);
    throw error;
  }
};

// 특별 이벤트 쿠폰 조회 (coupon_id: 1, 2, 3)
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

// 랜덤 이벤트 조회 API
export const getRandomEvents = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/v1/event/random', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('랜덤 이벤트 조회 실패:', error);
    throw error;
  }
}; 

// 공연 상세 정보 조회 API
export const getPerformanceDetail = async (performanceId: number) => {
  try {
    const response = await fetch(`http://localhost:8081/api/v1/performance/${performanceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('공연 상세 정보 조회 실패:', error);
    throw error;
  }
};

// 공연 이미지 조회 API (공연 상세 정보에서 이미지 추출)
export const getPerformanceImage = async (performanceId: number): Promise<string> => {
  try {
    const performanceDetail = await getPerformanceDetail(performanceId);
    return performanceDetail.img || `https://picsum.photos/300/200?random=${performanceId}`;
  } catch (error) {
    console.error('공연 이미지 조회 실패:', error);
    // 에러 시 기본 이미지 반환
    return `https://picsum.photos/300/200?random=${performanceId}`;
  }
}; 