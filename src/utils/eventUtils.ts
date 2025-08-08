import { EventDetail } from '../types/event';

// 랜덤 조회수 생성
export const generateRandomViewCount = (): number => {
  return Math.floor(Math.random() * 1000) + 500;
};

// 이벤트 당첨 여부 결정 (임시 로직)
export const determineWinner = (): boolean => {
  return Math.random() > 0.5; // 50% 확률로 당첨
};

// 이벤트 데이터 가져오기
export const getEventDetail = (eventId: string | undefined): EventDetail => {
  // TODO: 실제 API 호출로 대체
  const defaultEvent: EventDetail = {
    id: '1',
    title: '뮤지컬 <프리다>',
    description: '뮤지컬 정보 내용입니다.',
    venue: 'NOL 유니플렉스 1관',
    date: '2025.06.17 ~ 2026.09.07',
    time: '110분',
    duration: '110분',
    ageLimit: '15세 이상 관람가',
    seatInfo: 'R석 14번',
    validityPeriod: '2025.06.17 ~ 2026.09.07',
    entryPrice: '100',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  };

  return eventId ? defaultEvent : defaultEvent;
};

// 공유 기능
export const shareEvent = (title: string, description: string, url: string): void => {
  if (navigator.share) {
    navigator.share({
      title,
      text: description,
      url,
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('링크가 클립보드에 복사되었습니다!');
  }
};

// 가격 포맷팅
export const formatPrice = (price: string): string => {
  return `₩${price}k`;
};

// 랜덤 가격 생성 (임시)
export const generateRandomPrice = (): string => {
  return formatPrice((Math.floor(Math.random() * 100) + 50).toString());
}; 