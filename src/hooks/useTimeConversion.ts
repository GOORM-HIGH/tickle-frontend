import { useCallback } from 'react';

// Asia/Seoul 타임존으로 안전하게 포맷하는 유틸리티
const formatInKST = (
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    hour12: false,
    ...options,
  });
  const parts = (formatter as any).formatToParts
    ? (formatter as Intl.DateTimeFormat).formatToParts(date)
    : null;

  if (!parts) return formatter.format(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(p => p.type === type)?.value || '';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');

  const includeDate = Boolean(options.year || options.month || options.day);
  const includeTime = Boolean(options.hour || options.minute);

  if (includeDate && includeTime) return `${year}.${month}.${day} ${hour}:${minute}`;
  if (includeDate) return `${year}.${month}.${day}`;
  if (includeTime) return `${hour}:${minute}`;
  return formatter.format(date);
};

// UTC/KST 혼동 없이 입력의 타임존을 존중하고 KST로만 표시
export const useTimeConversion = () => {
  const convertUTCToKST = useCallback((dateString: string): string => {
    try {
      return formatInKST(dateString, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return dateString;
    }
  }, []);

  const formatDate = useCallback(
    (dateString: string, format: 'full' | 'date' | 'time' = 'full'): string => {
      try {
        if (format === 'date') {
          return formatInKST(dateString, { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
        if (format === 'time') {
          return formatInKST(dateString, { hour: '2-digit', minute: '2-digit' });
        }
        return formatInKST(dateString, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (error) {
        console.error('날짜 변환 오류:', error);
        return dateString;
      }
    },
    []
  );

  return { convertUTCToKST, formatDate };
};