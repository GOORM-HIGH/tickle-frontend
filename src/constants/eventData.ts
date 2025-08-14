import { EventDetail, RecommendedEvent, EventRule, EventMeta } from '../types/event';

// 이벤트 상세 데이터
export const EVENT_DETAILS: Record<string, EventDetail> = {
  '1': {
    id: '1',
    title: '뮤지컬 <프리다>',
    description: '뮤지컬 정보 내용입니다 어쩌고 저쩌고 간략하게 적을예정입니다.',
    venue: 'NOL 유니플렉스 1관(구 인터파크 플렉스)',
    date: '2025.06.17 ~ 2026.09.07',
    time: '110분',
    duration: '110분',
    ageLimit: '15세 이상 관람가',
    seatInfo: 'R석 14번',
    validityPeriod: '2025.06.17 ~ 2026.09.07',
    entryPrice: '100',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '2': {
    id: '2',
    title: '뮤지컬 <오페라의 유령>',
    description: '클래식 뮤지컬의 대표작, 오페라의 유령을 만나보세요.',
    venue: '예술의전당',
    date: '2025.07.01 ~ 2026.08.15',
    time: '150분',
    duration: '150분',
    ageLimit: '12세 이상 관람가',
    seatInfo: 'VIP석 5번',
    validityPeriod: '2025.07.01 ~ 2026.08.15',
    entryPrice: '150',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '3': {
    id: '3',
    title: '콘서트 <클래식 심포니>',
    description: '세계적인 오케스트라와 함께하는 클래식 음악의 향연.',
    venue: '세종문화회관',
    date: '2025.08.10 ~ 2026.10.20',
    time: '120분',
    duration: '120분',
    ageLimit: '전체 관람가',
    seatInfo: 'A석 12번',
    validityPeriod: '2025.08.10 ~ 2026.10.20',
    entryPrice: '80',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '4': {
    id: '4',
    title: '연극 <햄릿>',
    description: '셰익스피어의 대표작을 현대적으로 재해석한 연극.',
    venue: '대학로 예술극장',
    date: '2025.09.05 ~ 2026.11.30',
    time: '180분',
    duration: '180분',
    ageLimit: '16세 이상 관람가',
    seatInfo: 'S석 8번',
    validityPeriod: '2025.09.05 ~ 2026.11.30',
    entryPrice: '120',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '5': {
    id: '5',
    title: '발레 <백조의 호수>',
    description: '클래식 발레의 정점, 백조의 호수를 감상하세요.',
    venue: '예술의전당',
    date: '2025.10.15 ~ 2026.12.25',
    time: '140분',
    duration: '140분',
    ageLimit: '전체 관람가',
    seatInfo: 'P석 3번',
    validityPeriod: '2025.10.15 ~ 2026.12.25',
    entryPrice: '200',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  }
};

// 추천 이벤트 데이터
export const RECOMMENDED_EVENTS: RecommendedEvent[] = [
  {
    id: '2',
    title: 'Jazz Night Under the Stars',
    period: 'Aug 20, 2024',
    seatInfo: 'Reserved Seating',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=300&fit=crop',
    badge: 'Popular'
  },
  {
    id: '3',
    title: 'Rock Concert Extravaganza',
    period: 'Sep 5, 2024',
    seatInfo: 'VIP Access',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=300&fit=crop',
    badge: 'New'
  },
  {
    id: '4',
    title: 'Classical Symphony Evening',
    period: 'Sep 18, 2024',
    seatInfo: 'Premium Seating',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'Electronic Dance Festival',
    period: 'Oct 2, 2024',
    seatInfo: 'General Admission',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=300&fit=crop',
    badge: 'Hot'
  },
  {
    id: '6',
    title: 'Acoustic Unplugged Session',
    period: 'Oct 15, 2024',
    seatInfo: 'Intimate Setting',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=300&fit=crop'
  }
];

// 이벤트 규칙
export const EVENT_RULES: EventRule[] = [
  { icon: 'Target', text: '목표 금액에 도달하면 이벤트 당첨' },
  { icon: 'Zap', text: '포인트로 즉시 응모 가능' },
  { icon: 'Gift', text: '당첨 시 티켓 자동 발급' }
];

// 이벤트 메타 정보
export const EVENT_META: EventMeta[] = [
  { icon: 'ClockIcon', text: '이벤트 종료까지 3일 남음' },
  { icon: 'TrendingUp', text: '인기 이벤트 TOP 5' },
  { icon: 'Award', text: '인기' }
]; 