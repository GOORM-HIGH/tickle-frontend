import api from './api';

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
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 이벤트 목록 응답 DTO
export interface EventListResponseDto {
  eventId: number;
  name: string;
}

// API 응답 래퍼
export interface ResultResponse<T> {
  code: string;
  message: string;
  data: T;
}

// 이벤트 서비스 클래스
class EventService {
  /**
   * 이벤트 목록 조회 (쿠폰 또는 티켓)
   */
  async getEventList(
    eventType: EventType,
    page: number = 0,
    size: number = 10
  ): Promise<PagingResponse<EventListResponseDto>> {
    try {
      const response = await api.post<ResultResponse<PagingResponse<EventListResponseDto>>>(
        '/events',
        null,
        {
          params: {
            type: eventType,
            page: page,
            size: size
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('이벤트 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 쿠폰 목록 조회
   */
  async getCouponList(page: number = 0, size: number = 10): Promise<PagingResponse<CouponListResponseDto>> {
    try {
      const response = await api.post<ResultResponse<PagingResponse<CouponListResponseDto>>>(
        '/events',
        null,
        {
          params: {
            type: EventType.COUPON,
            page: page,
            size: size
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('쿠폰 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 티켓 이벤트 목록 조회
   */
  async getTicketList(page: number = 0, size: number = 10): Promise<PagingResponse<EventListResponseDto>> {
    try {
      const response = await api.post<ResultResponse<PagingResponse<EventListResponseDto>>>(
        '/events',
        null,
        {
          params: {
            type: EventType.TICKET,
            page: page,
            size: size
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('티켓 이벤트 목록 조회 실패:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
export default eventService; 