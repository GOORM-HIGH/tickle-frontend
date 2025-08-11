// Cookie 유틸리티 함수들

/**
 * Cookie에서 값을 가져옵니다
 * @param name Cookie 이름
 * @returns Cookie 값 또는 null
 */
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Cookie에 값을 설정합니다
 * @param name Cookie 이름
 * @param value Cookie 값
 * @param days 만료일수 (기본값: 7일)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

/**
 * Cookie를 삭제합니다
 * @param name Cookie 이름
 */
export function removeCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}
