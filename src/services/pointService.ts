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

export interface PointSimpleResponse {
  credit: number;
  target: string;
  orderId: string;
  createdAt: string;
}

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
  getMyPointBalance: async (): Promise<PointSimpleResponse> => {
    const response = await api.get('/api/v1/pay/balance');
    return response.data.data;
  },

  // 포인트 내역 조회
  getMyPointHistory: async (page: number = 0, size: number = 10) => {
    const response = await api.get(`/api/v1/pay/history?page=${page}&size=${size}`);
    return response.data.data;
  }
}; 