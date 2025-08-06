/**
 * 'YYYY-MM-DD' 형식 문자열을 Instant(ISO-8601) 문자열로 변환
 * @param dateStr '2025-08-06' 형식 문자열
 * @param toKST KST(Asia/Seoul)로 변환할지 여부 (기본 false: UTC)
 */
export async function toInstant(dateStr: string, toKST: boolean = false): Promise<string | null> {
    if (!dateStr) return null;

    if (toKST) {
        // KST로 변환 (UTC+9)
        const date = new Date(dateStr);
        date.setHours(date.getHours() + 9); // 9시간 추가
        return date.toISOString();
    }

    // UTC 00:00:00으로 변환
    return new Date(dateStr + "T00:00:00Z").toISOString();
}
