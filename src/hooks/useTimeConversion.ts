import { useCallback } from 'react';

// UTC 시간을 한국 시간으로 변환하는 커스텀 hook
export const useTimeConversion = () => {
  // UTC 시간을 한국 시간으로 변환하는 함수
  const convertUTCToKST = useCallback((utcDateString: string): string => {
    try {
      const utcDate = new Date(utcDateString);
      const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (한국 시간)
      
      // 날짜 형식 포맷팅
      const year = kstDate.getFullYear();
      const month = String(kstDate.getMonth() + 1).padStart(2, '0');
      const day = String(kstDate.getDate()).padStart(2, '0');
      const hours = String(kstDate.getHours()).padStart(2, '0');
      const minutes = String(kstDate.getMinutes()).padStart(2, '0');
      
      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return utcDateString; // 변환 실패시 원본 반환
    }
  }, []);

  // 다양한 날짜 형식 옵션을 제공하는 함수
  const formatDate = useCallback((utcDateString: string, format: 'full' | 'date' | 'time' = 'full'): string => {
    try {
      const utcDate = new Date(utcDateString);
      const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
      
      const year = kstDate.getFullYear();
      const month = String(kstDate.getMonth() + 1).padStart(2, '0');
      const day = String(kstDate.getDate()).padStart(2, '0');
      const hours = String(kstDate.getHours()).padStart(2, '0');
      const minutes = String(kstDate.getMinutes()).padStart(2, '0');
      
      switch (format) {
        case 'date':
          return `${year}.${month}.${day}`;
        case 'time':
          return `${hours}:${minutes}`;
        case 'full':
        default:
          return `${year}.${month}.${day} ${hours}:${minutes}`;
      }
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return utcDateString;
    }
  }, []);

  return {
    convertUTCToKST,
    formatDate
  };
}; 