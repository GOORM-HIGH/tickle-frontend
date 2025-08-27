import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { usePerformances } from "../../../hooks/mypage/usePerformances";
import { useScrollToTop } from "../../../hooks/useScrollToTop";
import { PerformanceListItem } from "../../../home/types/performance";
import { MY_PAGE_TABS } from "../../../feat-mypage/constants/tabs";
import "../../../styles/PerformanceHostPage.css";
import MyPageCard from "../../../components/member/mypage/MyPageCard";

export default function MyPerformanceDashboardPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const isHost = currentUser?.role === "HOST";

  const {
    performances,
    loading,
    handleDeletePerformance, // 삭제 함수
    handleEditPerformance, // 수정(라우팅) 함수
    loadMyPerformances, // 필요 시 수동 재조회
  } = usePerformances(MY_PAGE_TABS.PERFORMANCES, !!isHost);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreatePerformance = () => navigate("/performance/create");

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
      ) : !Array.isArray(performances) || performances.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon">🎭</div>
          <h3>생성한 공연이 없습니다</h3>
          <p>첫 번째 공연을 생성해보세요!</p>
          <button className="create-button" onClick={handleCreatePerformance}>
            공연 생성하기
          </button>
        </div>
      ) : (
        <div className="performance-grid">
          {performances.map((performance: PerformanceListItem) => (
            <div key={performance.performanceId} className="performance-card">
              <div className="performance-create-image">
                {performance.img ? (
                  <img
                    src={performance.img}
                    alt={performance.title}
                    className="performance-create-img"
                    loading="lazy"
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
                    <span className="value">
                      {formatDate(performance.date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">상태:</span>
                    <span
                      className={`status-badge ${String(
                        performance.status || ""
                      ).toLowerCase()}`}
                    >
                      {performance.status}
                    </span>
                  </div>
                </div>

                <div className="performance-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEditPerformance(performance.performanceId)
                    }
                  >
                    수정
                  </button>
                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDeletePerformance(performance.performanceId)
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MyPageCard>
  );
}
