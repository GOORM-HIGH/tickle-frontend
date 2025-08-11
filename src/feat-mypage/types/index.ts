export interface PointHistory {
  id: string;
  status: 'completed' | 'cancelled' | 'charge_completed';
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  bankInfo?: string;
  orderId: string;
  type: 'charge' | 'use';
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: string;
  eventType: string;
}

export interface CouponFormData {
  name: string;
  description: string;
  discountType: string;
  discountValue: string;
  minAmount: string;
  maxDiscount: string;
  validFrom: string;
  validTo: string;
  quantity: string;
  couponType: string;
} 