import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Bookmark } from "lucide-react";

import { useAuth } from "../../../hooks/useAuth.ts";
import { useScrollToTop } from "../../../hooks/useScrollToTop.ts";
import { scrapService, PerformanceScrapDto } from "../../../services/scrapService.ts";

import SectionHeader from "../../../components/member/mypage/SectionHeader.tsx";
import ScrapGrid from "../../../components/member/mypage/ScrapGrid.tsx";

const MyScrapedPerformancesPages: React.FC = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const { isLoggedIn, currentUser } = useAuth();

    const [scraps, setScraps] = useState<PerformanceScrapDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    // 인증 상태 확인 및 권한 체크
    useEffect(() => {
        const hasToken = !!Cookies.get("accessToken");
        // 토큰은 있는데 auth 훅 초기화 전이라면 잠시 대기
        if (hasToken && !isLoggedIn) return;
        if (isLoggedIn && !currentUser) return;

        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/");
        }
    }, [isLoggedIn, currentUser, navigate]);

    // 스크랩 목록 조회
    useEffect(() => {
        const fetchScraps = async () => {
            if (!isLoggedIn) return;
            try {
                setLoading(true);
                const scrapList = await scrapService.getMyScraps();
                setScraps(scrapList);
            } catch (err: any) {
                console.error("스크랩 목록 조회 실패:", err);
                setError("스크랩 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchScraps();
    }, [isLoggedIn]);

    // 스크랩 제거
    const handleRemoveScrap = async (performanceId: number) => {
        const confirmRemove = window.confirm(
            "이 공연을 스크랩에서 제거하시겠습니까?"
        );
        if (!confirmRemove) return;

        try {
            await scrapService.removeScrap(performanceId);
            setScraps((prev) =>
                prev.filter((scrap) => scrap.performanceId !== performanceId)
            );
        } catch (err: any) {
            console.error("스크랩 제거 실패:", err);
            const code = err?.response?.status;
            const msg = err?.response?.data?.message || err?.message;

            if (code === 500) {
                if (
                    typeof msg === "string" &&
                    (msg.includes("unique result") || msg.includes("duplicate"))
                ) {
                    alert(
                        "스크랩 데이터에 문제가 있습니다. 페이지를 새로고침 후 다시 시도해주세요."
                    );
                    window.location.reload();
                } else {
                    alert("서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
            } else if (code === 404) {
                alert("해당 스크랩을 찾을 수 없습니다.");
                setScraps((prev) =>
                    prev.filter((scrap) => scrap.performanceId !== performanceId)
                );
            } else {
                alert("스크랩 제거에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    // 공연 상세 페이지로 이동
    const handleViewDetails = (performanceId?: number) => {
        if (!performanceId) {
            navigate("/");
            return;
        }
        navigate(`/performance/${performanceId}`);
    };

    // 상태별 렌더
    if (!isLoggedIn || loading) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-semibold">
                    {loading ? "스크랩 목록을 불러오는 중..." : "권한 확인 중..."}
                </h2>
                <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-semibold">오류 발생</h2>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <button
                    className="mt-4 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => window.location.reload()}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div>
            <SectionHeader
                title={
                    <>
                        <Bookmark className="title-icon" /> 스크랩한 공연
                    </>
                }
                subtitle="관심있는 공연을 모아서 확인해보세요"
            />

            <ScrapGrid
                scraps={scraps}
                onViewDetails={handleViewDetails}
                onRemoveScrap={handleRemoveScrap}
            />
        </div>
    );
};

export default MyScrapedPerformancesPages;
