export interface PointHistory {
  credit: number;
  target: string;
  orderId: string;
  createdAt: string;
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