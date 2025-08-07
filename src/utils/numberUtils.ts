/**
 * 퍼센트를 BigDecimal 문자열로 변환
 * @param percent 퍼센트 값 (예: 5 → 0.05)
 * @param scale 소수점 자리수 (기본: 2)
 */
export const toBigDecimalString = (percent: number, scale: number = 2): string => {
    if (isNaN(percent)) return "0.00";
    return (percent / 100).toFixed(scale);
};
