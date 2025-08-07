export interface EventDetail {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  duration: string;
  ageLimit: string;
  seatInfo: string;
  validityPeriod: string;
  entryPrice: string;
  posterUrl: string;
  badge?: string;
  description?: string;
}

export interface RecommendedEvent {
  id: string;
  title: string;
  period: string;
  seatInfo: string;
  posterUrl: string;
  badge?: string;
}

export interface EventRule {
  icon: string;
  text: string;
}

export interface EventMeta {
  icon: string;
  text: string;
} 