import api from './api';
import {
    SettlementResponseDto,
    PagingResponse,
    ResultResponse,
    SettlementSearchParams
} from '../types/settlement';

export const settlementService = {
    // 정산 내역 조회
    async getSettlements(params: SettlementSearchParams): Promise<PagingResponse<SettlementResponseDto>> {
        const queryParams = new URLSearchParams();

        // 필수 파라미터
        queryParams.append('periodType', params.periodType);
        queryParams.append('viewType', params.viewType);
        queryParams.append('page', params.page.toString());
        queryParams.append('size', params.size.toString());

        // 선택적 파라미터
        if (params.settlementCycle && params.settlementCycle.trim() !== '') {
            queryParams.append('settlementCycle', params.settlementCycle);
        }
        if (params.startDate) {
            queryParams.append('startDate', params.startDate);
        }
        if (params.endDate) {
            queryParams.append('endDate', params.endDate);
        }
        if (params.performanceTitle) {
            queryParams.append('performanceTitle', params.performanceTitle);
        }
        if (params.statusId) {
            queryParams.append('statusId', params.statusId.toString());
        }

        try {
            const response = await api.get<ResultResponse<PagingResponse<SettlementResponseDto>>>(
                `/api/v1/settlements?${queryParams.toString()}`
            );

            // 디버깅: 응답 데이터 로그
            console.log('백엔드 응답:', response.data);
            console.log('응답 상태:', (response.data as any).status);
            console.log('응답 메시지:', response.data.message);

            if ((response.data as any).status === 200) {
                console.log('정산 내역 조회 성공!');
                return response.data.data;
            } else {
                console.log('정산 내역 조회 실패 - 상태:', (response.data as any).status);
                throw new Error(response.data.message || '정산 내역 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('정산 내역 조회 실패:', error);
            throw error;
        }
    },

    // 미정산 금액 조회
    async getUnsettledAmount(): Promise<number> {
        try {
            const response = await api.get<ResultResponse<number>>('/api/v1/settlements/unsettled-amount');

            if ((response.data as any).status === 200) {
                console.log('미정산 금액 조회 성공!');
                return response.data.data;
            } else {
                console.log('미정산 금액 조회 실패 - 상태:', (response.data as any).status);
                throw new Error(response.data.message || '미정산 금액 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('미정산 금액 조회 실패:', error);
            // 에러 발생 시 기본값 반환
            return 0;
        }
    },

    // 엑셀 다운로드
    async downloadExcel(params: Omit<SettlementSearchParams, 'page' | 'size'>): Promise<void> {
        try {
            const queryParams = new URLSearchParams();

            if (params.periodType) {
                queryParams.append('periodType', params.periodType);
            }
            if (params.viewType) {
                queryParams.append('viewType', params.viewType);
            }

            // 주간 정산에서 '전체' 선택 시 settlementCycle을 전송하지 않음
            if (params.settlementCycle && params.settlementCycle.trim() !== '') {
                if (params.periodType === 'WEEKLY' &&
                    (params.settlementCycle.endsWith('-') || params.settlementCycle.split('-').length === 2)) {
                    // 주간에서 '전체' 선택 시 파라미터 제외 (2025-08 또는 2025-08- 형태)
                    console.log('주간 정산 전체 선택: settlementCycle 파라미터 제외', params.settlementCycle);
                } else {
                    queryParams.append('settlementCycle', params.settlementCycle);
                }
            }

            if (params.startDate) {
                queryParams.append('startDate', params.startDate);
            }
            if (params.endDate) {
                queryParams.append('endDate', params.endDate);
            }
            if (params.performanceTitle && params.performanceTitle.trim() !== '') {
                queryParams.append('performanceTitle', params.performanceTitle);
            }
            if (params.statusId) {
                queryParams.append('statusId', params.statusId.toString());
            }

            const response = await api.get(`/api/v1/settlements/excel?${queryParams.toString()}`, {
                responseType: 'blob', // 파일 다운로드를 위해 blob으로 설정
            });

            // 응답 상태 확인
            if (response.status === 204) {
                // 204 No Content: 다운로드할 데이터 없음
                throw new Error('다운로드할 정산 내역이 없습니다.');
            }

            // 파일 다운로드 처리
            this.downloadFile(response.data, `정산내역_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error('엑셀 다운로드 실패:', error);
            throw error;
        }
    },

    /**
     * 파일 다운로드 헬퍼 메서드
     */
    downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};



