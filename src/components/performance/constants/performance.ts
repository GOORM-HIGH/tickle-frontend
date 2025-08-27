import { PerformanceGenre, VenueType } from '../../../types/performance';

export const HALL_TYPES: VenueType[] = [
  { id: 'A', name: 'A' },
  { id: 'B', name: 'B' },
];

export const VENUE_LOCATIONS = [
  { id: 'seoul-arts-center', name: '예술의전당', address: '서울특별시 서초구 남부순환로 2406' },
  { id: 'sejong-center', name: '세종문화회관', address: '서울특별시 종로구 세종로 1-57' },
  { id: 'lg-arts-center', name: 'LG아트센터', address: '서울특별시 강남구 테헤란로 152' },
  { id: 'national-theater', name: '국립극장', address: '서울특별시 중구 장충단로 59' },
  { id: 'national-museum', name: '국립중앙박물관', address: '서울특별시 용산구 서빙고로 137' },
  { id: 'coex-auditorium', name: '코엑스 오디토리움', address: '서울특별시 강남구 삼성로 159' },
  { id: 'olympic-park', name: '올림픽공원', address: '서울특별시 송파구 올림픽로 25' },
  { id: 'seoul-world-cup', name: '서울월드컵경기장', address: '서울특별시 마포구 월드컵로 240' },
  { id: 'jamsil-arena', name: '잠실실내체육관', address: '서울특별시 송파구 올림픽로 25' },
  { id: 'custom', name: '직접 입력', address: '' }
]; 