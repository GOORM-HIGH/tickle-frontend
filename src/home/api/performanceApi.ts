import api from '../../services/api';

// 백엔드 응답 타입 정의
export interface PerformanceDto {
  performanceId: number;
  title: string;
  date: string; // Instant를 string으로 받음
  img: string;
}

// 장르 DTO 타입 정의 (백엔드 GenreDto와 일치)
export interface GenreDto {
  genreId: string;  // 백엔드에서 문자열로 오고 있음
  title: string;    // "genreTitle"이 아니라 "title"
}

// 공연 상세 정보 타입 정의 (백엔드 PerformanceDetailDto와 정확히 일치)
export interface PerformanceDetailDto {
  performanceId: number;
  title: string;
  img: string;
  date: string;
  statusDescription: string;
  runtime: number;
  event: boolean; // 백엔드에서 event 필드로 응답
  price: string;
  hallAddress: string;
  hostBizName: string;
  startDate: string;
  endDate: string;
  // 추가 필드들 (API 응답에 있을 수 있음)
  genreTitle?: string;
  hallType?: string;
}

// 오픈예정 공연 타입 정의 (예매 기간 정보 포함)
export interface ComingSoonDto {
  performanceId: number;
  title: string;
  date: string;
  img: string;
  startDate: string;
  endDate: string;
}

// 백엔드 ResultResponse 타입 정의
export interface ResultResponse<T> {
  status: number; // 백엔드에서는 status를 사용
  message: string;
  data: T;
}

// 페이징 응답 타입 정의 (백엔드 PagingResponse와 일치)
export interface PagingResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface PerformanceResponse {
  data: PerformanceDto[];
  message?: string;
  status?: string;
}

// 프론트엔드에서 사용할 타입 (기존 인터페이스와 매핑)
export interface PerformanceCard {
  id: number;
  title: string;
  date: string;
  img: string;
}

// 오픈예정 공연 카드 타입 (새로운 디자인에 맞춤)
export interface ComingSoonCard {
  id: number;
  title: string;
  date: string;
  time: string;
  img: string;
  reservationType: string;
  buttonType: string;
  buttonText: string;
  startDate: string;
  endDate: string;
}

// 백엔드 응답을 프론트엔드 타입으로 변환하는 함수
export const mapPerformanceDtoToCard = (dto: PerformanceDto): PerformanceCard => {
  return {
    id: dto.performanceId,
    title: dto.title,
    date: dto.date,
    img: dto.img
  };
};

// 오픈예정 DTO를 카드 타입으로 변환하는 함수
export const mapComingSoonDtoToCard = (dto: ComingSoonDto): ComingSoonCard => {
  return {
    id: dto.performanceId,
    title: dto.title,
    date: dto.date,
    time: dto.date, // 시간 정보는 date에서 추출
    img: dto.img,
    reservationType: '일반예매', // 기본값
    buttonType: 'default',
    buttonText: '단독판매',
    startDate: dto.startDate,
    endDate: dto.endDate
  };
};

// 공연 생성 요청 DTO (백엔드 PerformanceRequestDto와 일치)
export interface CreatePerformanceRequestDto {
  title: string;
  genreId: number;
  date: string; // Instant 형식 (ISO 8601)
  runtime: number;
  hallType: string; // 'A', 'B', 'C' 등
  hallAddress: string;
  startDate: string; // Instant 형식 (ISO 8601)
  endDate: string; // Instant 형식 (ISO 8601)
  isEvent: boolean;
  img: string;
  // createdAt, updatedAt은 서버에서 자동 설정되므로 제외
}

// 날짜 입력 시 시간 자동 설정 함수
export const formatDateWithTime = (dateString: string, timeType: 'performance' | 'start' | 'end'): string => {
  switch (timeType) {
    case 'performance':
      // 공연 날짜: 00:00:00
      return `${dateString}T00:00:00Z`;
    case 'start':
      // 예매 시작: 09:00:00
      return `${dateString}T09:00:00Z`;
    case 'end':
      // 예매 종료: 23:59:59
      return `${dateString}T23:59:59Z`;
    default:
      return dateString;
  }
};

// 공연 관련 API 함수들
export const performanceApi = {
  // 인기 공연 목록 조회
  getPopularPerformances: async (): Promise<ResultResponse<PerformanceDto[]>> => {
    const response = await api.get('/api/v1/performance/ranking', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 오픈예정 공연 목록 조회
  getComingSoonPerformances: async (): Promise<ResultResponse<ComingSoonDto[]>> => {
    const response = await api.get('/api/v1/performance/open', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 이미지 프록시 API
  getImageProxy: (imageUrl: string): string => {
    // 백엔드 프록시 API를 통해 이미지 로드
    return `http://localhost:8081/api/v1/image/proxy?url=${encodeURIComponent(imageUrl)}`;
  },

  // 공연 상세 정보 조회
  getPerformanceDetail: async (performanceId: number): Promise<ResultResponse<PerformanceDetailDto>> => {
    const response = await api.get(`/api/v1/performance/${performanceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 공연 추천 목록 조회
  getRelatedPerformances: async (performanceId: number): Promise<ResultResponse<PerformanceDto[]>> => {
    const response = await api.get(`/api/v1/performance/${performanceId}/recommend`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 장르별 공연 랭킹 TOP10 조회
  getTop10ByGenre: async (genreId: number): Promise<ResultResponse<PerformanceDto[]>> => {
    const response = await api.get(`/api/v1/performance/genre/${genreId}/ranking`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 장르별 공연 목록 조회 (페이징)
  getPerformancesByGenre: async (genreId: number, page: number = 0, size: number = 8): Promise<ResultResponse<PagingResponse<PerformanceDto>>> => {
    const response = await api.get(`/api/v1/performance/genre/${genreId}`, {
      params: {
        page,
        size
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 공연 검색
  searchPerformances: async (keyword: string, page: number = 0, size: number = 8): Promise<ResultResponse<PagingResponse<PerformanceDto>>> => {
    const response = await api.get(`/api/v1/performance/search/${encodeURIComponent(keyword)}`, {
      params: {
        page,
        size
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 장르 목록 조회
  getGenres: async (): Promise<ResultResponse<GenreDto[]>> => {
    const response = await api.get('/api/v1/performance/genre', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },

  // 공연 생성
  createPerformance: async (data: CreatePerformanceRequestDto): Promise<ResultResponse<PerformanceDetailDto>> => {
    const response = await api.post('/api/v1/performance', data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  },
}; 