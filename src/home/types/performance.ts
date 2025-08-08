export interface PerformanceFormData {
  title: string;
  genreId: number;
  date: string;
  runtime: number;
  hallType: string;
  hallAddress: string;
  startDate: string;
  endDate: string;
  isEvent: boolean;
  img?: string;
}

export interface PerformanceRequestDto {
  title: string;
  genreId: number;
  date: string; // ISO 8601 형식: "2025-08-23T23:59:59+09:00"
  runtime: number;
  hallType: string;
  hallAddress: string;
  startDate: string; // ISO 8601 형식: "2025-08-23T23:59:59+09:00"
  endDate: string; // ISO 8601 형식: "2025-08-23T23:59:59+09:00"
  isEvent: boolean;
  img?: string;
}

export interface UpdatePerformanceRequestDto {
  title?: string;
  genreId?: number;
  date?: string; // ISO 8601 형식
  runtime?: number;
  hallType?: string;
  hallAddress?: string;
  startDate?: string; // ISO 8601 형식
  endDate?: string; // ISO 8601 형식
  img?: string;
  isEvent?: boolean;
}

export interface PerformanceListItem {
  performanceId: number;
  title: string;
  date: string;
  runtime: number;
  hallType: string;
  hallAddress: string;
  status: string;
  isEvent: boolean;
  img?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceGenre {
  id: number;
  name: string;
}

export interface VenueType {
  id: string;
  name: string;
} 