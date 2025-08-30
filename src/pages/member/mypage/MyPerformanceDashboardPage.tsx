import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useScrollToTop } from "../../../hooks/useScrollToTop";
import MyPageCard from "../../../components/member/mypage/MyPageCard";
import { performanceApi, PerformanceHostDto, ResultResponse, PagingResponse } from "../../../services/performanceApi";
import "../../../styles/PerformanceHostPage.css";

export default function MyPerformanceDashboardPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const isHost = currentUser?.role === "HOST";

  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const [performances, setPerformances] = useState<PerformanceHostDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (targetPage: number) => {
    setLoading(true);
    try {
      const res: ResultResponse<PagingResponse<PerformanceHostDto>> =
        await performanceApi.getMyPerformances(targetPage, size);

      setPerformances(res.data.content);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setIsLast(res.data.isLast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHost) fetchPage(0);
  }, [isHost]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // 서버가 Z(UTC)로 내려주므로 KST 표시가 필요하면 toLocaleString으로 충분
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreatePerformance = () => navigate("/performance/create");
  const handleEditPerformance = (id: number) => navigate(`/performance/edit/${id}`);
  const handleDeletePerformance = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await performanceApi.deletePerformance(id);
    // 현재 페이지 갱신
    fetchPage(page);
  };

  // 권한 체크
  if (!isLoggedIn || !isHost) {
    return (
      <div className="performance-host-page">
        <div className="page-container">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <h2>권한이 없습니다</h2>
            <p>HOST 권한이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MyPageCard
      minWidth="1000px"
      centered={false}
      fullHeight={false}
      containerClassName="bg-transparent justify-start items-stretch"
      cardClassName="min-h-[calc(100vh-200px)] w-full"
      visibleFor={["HOST"]}
      fallbackWhenHidden={
        <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">권한이 없습니다</h2>
        <p className="text-gray-500 mt-2">HOST 권한이 필요합니다.</p>
        </div>
      }
    >
      <div className="page-header">
        <h2 className="page-title">내가 생성한 공연</h2>
        <button className="create-button" onClick={handleCreatePerformance}>
          + 새 공연 생성
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>공연 목록을 불러오는 중...</p>
        </div>
      ) : performances.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon">🎭</div>
          <h3>생성한 공연이 없습니다</h3>
          <p>첫 번째 공연을 생성해보세요!</p>
          <button className="create-button" onClick={handleCreatePerformance}>
            공연 생성하기
          </button>
        </div>
      ) : (
        <>
        <div className="performance-grid">
          {performances.map((performance) => (
            <div key={performance.performanceId} className="performance-card">
              <div className="performance-create-image">
                {performance.img ? (
                  <img
                    src={performance.img}   // ✅ 여기서는 그냥 응답에 있는 img 필드 사용
                    alt={performance.title}
                    className="performance-create-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/fallback-poster.png"; // 실패 시 대체 이미지
                    }}
                  />
                ) : (
                  <div className="no-image">🎭</div>
                )}
              </div>

                <div className="performance-info">
                  <h3 className="performance-title">{performance.title}</h3>
                  <div className="performance-details">
                    <div className="detail-item">
                      <span className="label">공연일:</span>
                      <span className="value">{formatDate(performance.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">상태:</span>
                      <span
                        className={`status-badge ${String(
                          performance.statusDescription || ""
                        ).toLowerCase()}`}
                      >
                        {performance.statusDescription}
                      </span>
                    </div>
                  </div>

                  <div className="performance-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditPerformance(performance.performanceId)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeletePerformance(performance.performanceId)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ 간단 페이지네이션 */}
          <div className="pagination">
            <button
              className="pager"
              disabled={page <= 0}
              onClick={() => fetchPage(page - 1)}
            >
              ← 이전
            </button>
            <span className="page-info">
              {page + 1} / {totalPages}
            </span>
            <button
              className="pager"
              disabled={isLast}
              onClick={() => fetchPage(page + 1)}
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </MyPageCard>
  );
}
