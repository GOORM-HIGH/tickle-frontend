import api from './api';

export interface BootpayConfigResponse {
  appId: string;
  orderId: string;
  username: string;
  email: string;
  phone: string;
}

export interface ChargePointRequest {
  orderId: string;
  order_name: string;
  receipt_id: string;
  amount: number;
  username: string;
  purchasedAt: string;
}

export interface PointResponse {
  orderId: string;
  orderName: string;
  receiptId: string;
  amount: number;
  totalBalance: number;
  username: string;
  purchasedAt: string;
}

// 백엔드 API 응답 구조에 맞는 타입
export interface PointSimpleResponseDto {
  credit: number;
  target: string;
  orderId: string;
  createdAt: string;
}

export interface PagingResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

// 기존 호환성을 위한 타입 (deprecated)
export interface PointSimpleResponse extends PointSimpleResponseDto {}
export interface PointHistoryResponse extends PointSimpleResponseDto {}

export const pointService = {
  // 부트페이 설정 가져오기
  getBootpayConfig: async (): Promise<BootpayConfigResponse> => {
    const response = await api.get('/api/v1/pay/bootpay-config');
    return response.data;
  },

  // 포인트 충전
  chargePoint: async (request: ChargePointRequest): Promise<PointResponse> => {
    const response = await api.post('/api/v1/pay/charge', request);
    return response.data.data;
  },

  // 보유 포인트 조회
  getMyPointBalance: async (): Promise<PointSimpleResponseDto> => {
    const response = await api.get('/api/v1/pay/balance');
    return response.data.data;
  },

  // 포인트 내역 조회 (페이지네이션 포함) - 백엔드 API 구조에 맞게 수정
  getMyPointHistory: async (page: number = 0, size: number = 10): Promise<PagingResponse<PointHistoryResponse>> => {
    try {
      console.log('포인트 내역 조회 API 호출:', { page, size });
      
      // 백엔드 API 경로 확인 - 여러 가능한 경로 시도
      let response;
      let apiUrl;
      
      // 첫 번째 시도: /api/v1/pay/history (실제로 작동하는 경로)
      try {
        apiUrl = `/api/v1/pay/history?page=${page}&size=${size}`;
        console.log('첫 번째 시도 - API URL:', apiUrl);
        response = await api.get(apiUrl);
        console.log('첫 번째 시도 성공:', response);
      } catch (firstError: any) {
        console.log('첫 번째 시도 실패:', firstError.response?.status);
        
        // 두 번째 시도: /api/v1/points/history
        try {
          apiUrl = `/api/v1/points/history?page=${page}&size=${size}`;
          console.log('두 번째 시도 - API URL:', apiUrl);
          response = await api.get(apiUrl);
          console.log('두 번째 시도 성공:', response);
        } catch (secondError: any) {
          console.log('두 번째 시도 실패:', secondError.response?.status);
          
          // 세 번째 시도: /api/v1/point/history
          try {
            apiUrl = `/api/v1/point/history?page=${page}&size=${size}`;
            console.log('세 번째 시도 - API URL:', apiUrl);
            response = await api.get(apiUrl);
            console.log('세 번째 시도 성공:', response);
          } catch (thirdError: any) {
            console.error('모든 API 경로 시도 실패');
            throw thirdError;
          }
        }
      }
      
      console.log('최종 API 응답:', response);
      console.log('응답 데이터:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('포인트 내역 조회 API 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }
}; 