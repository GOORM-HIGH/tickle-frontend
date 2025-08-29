// src/hooks/useReservationCountdown.ts
import { useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'BEFORE' | 'D1' | 'TODAY' | 'OPEN' | 'ENDED';

interface Countdown {
  phase: Phase;
  disabled: boolean;
  secondsLeft: number;
  d: number; h: number; m: number; s: number;
  buttonLabel: string;
  helperText?: string;
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const fmt2 = (n: number) => n.toString().padStart(2, '0');

function split(ms: number) {
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  const s = Math.floor((ms % MIN) / SEC);
  return { d, h, m, s };
}

export function useReservationCountdown(startISO: string, endISO: string): Countdown {
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<number | null>(null);

  // ✅ NaN 방어 (빈 문자열/잘못된 포맷)
  const start = useMemo(() => {
    const t = new Date(startISO).getTime();
    return Number.isFinite(t) ? t : Number.NaN;
  }, [startISO]);

  const end = useMemo(() => {
    const t = new Date(endISO).getTime();
    return Number.isFinite(t) ? t : Number.NaN;
  }, [endISO]);

  // phase 계산
  const { phase, msToStart }: { phase: Phase; msToStart: number } = useMemo(() => {
    const n = now;

    // 날짜가 아직 없어도 안전하게 BEFORE 처리
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return { phase: 'BEFORE', msToStart: 0 };
    }

    if (n > end) return { phase: 'ENDED', msToStart: 0 };
    if (n >= start) return { phase: 'OPEN', msToStart: 0 };

    const diff = start - n;
    const nowDate = new Date(n).toDateString();
    const startDate = new Date(start).toDateString();

    if (nowDate === startDate) return { phase: 'TODAY', msToStart: diff };
    if (diff <= DAY) return { phase: 'D1', msToStart: diff };

    return { phase: 'BEFORE', msToStart: diff };
  }, [now, start, end]);

  // D-1 / 당일에만 1초 타이머
  useEffect(() => {
    if (phase === 'D1' || phase === 'TODAY') {
      timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [phase]);

  // 숫자 포맷 및 남은 시간 분해
  const { d, h, m, s } = split(Math.max(msToStart, 0));

  // 라벨/설명 생성
  let buttonLabel = '예매하기';
  let helperText: string | undefined;
  let disabled = false;

  switch (phase) {
    case 'ENDED':
      buttonLabel = '예매종료';
      disabled = true;
      helperText = '예매 기간이 종료되었습니다.';
      break;

    case 'OPEN':
      buttonLabel = '예매하기';
      disabled = false;
      break;

    case 'TODAY':
      buttonLabel = `시작까지 ${fmt2(h)}:${fmt2(m)}:${fmt2(s)}`;
      disabled = true;
      helperText = '오늘 오픈! 잠시 후 예매가 시작됩니다.';
      break;

    case 'D1': {
      const startTime = Number.isFinite(start) ? new Date(start) : null;
      const hh = startTime ? fmt2(startTime.getHours()) : '--';
      const mm = startTime ? fmt2(startTime.getMinutes()) : '--';
      buttonLabel = `내일 ${hh}:${mm} 시작까지 ${fmt2(h)}:${fmt2(m)}:${fmt2(s)}`;
      disabled = true;
      helperText = 'D-1: 내일 예매가 시작됩니다.';
      break;
    }

    case 'BEFORE': {
      disabled = true;

      // ✅ 하루 이상 남았으면 "예매예정 D-n"
      if (Number.isFinite(start)) {
        const dday = Math.ceil((start - now) / DAY);
        if (dday > 1) {
          buttonLabel = `예매예정 D-${dday}`;
          helperText = undefined; // 필요 없으면 숨김
          break;
        }
        // D-1 이하는 위 케이스들에서 처리됨
        const startStr = new Date(start).toLocaleDateString();
        buttonLabel = '예매 예정';
        helperText = `시작일: ${startStr}`;
      } else {
        // 아직 시작일 모르면 기본 문구
        buttonLabel = '예매 예정';
        helperText = undefined;
      }
      break;
    }
  }

  return {
    phase,
    disabled,
    secondsLeft: Math.max(Math.floor(msToStart / SEC), 0),
    d, h, m, s,
    buttonLabel,
    helperText,
  };
}
