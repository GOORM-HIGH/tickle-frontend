import { useEffect, useState } from "react";
import { FaBell, FaUser, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";
import NotificationPopover from "../../notification/NotificationPopover";
import GenreMenu from "./GenreMenu";
import { MdEmojiEvents } from "react-icons/md";

interface FeatureMenuProps {
  isSignIn: boolean;
  shouldRefreshNotificationList?: boolean; // 실시간알림 수신 여부
  onNotificationRefreshed?: () => void; // 알림 새로고침 후 콜백
}

export default function FeatureMenu({
  isSignIn,
  shouldRefreshNotificationList,
  onNotificationRefreshed,
}: FeatureMenuProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<
    NotificationResponse[]
  >([]);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleNotificationRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const fetchNotificationList = async () => {
    try {
      const token = getAccessToken();
      
      if (!token) return;

      const { data } = await api.get("/api/v1/notifications");
      const raw = Array.isArray(data?.data) ? data.data : [];
      const formatted = raw.map((item: any) => ({
        ...item,
        isRead: item.read ?? item.isRead ?? false,
      }));

      setNotificationList(formatted);
    } catch (error) {
      console.error("알림 API 조회 실패:", error);
    }
  };

  // 로그인 시 최초 호출
  useEffect(() => {
    if (isSignIn) {
      fetchNotificationList();
    }
  }, [isSignIn]);

  // SSE로 새 알림 도착했을 때 다시 호출
  useEffect(() => {
    if (isSignIn && shouldRefreshNotificationList) {
      fetchNotificationList().then(() => {
        onNotificationRefreshed?.(); // 상태 초기화 콜백 호출
      });
    }
  }, [shouldRefreshNotificationList, isSignIn]);

  const hasUnread = notificationList.some((n) => !n.isRead);

  return (
    <div className="relative bg-gradient-to-r from-white to-[#f9fbff] border-t border-gray-100 px-8 py-3">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center text-sm text-gray-900">
        {/* 왼쪽: 장르 메뉴 */}
        <GenreMenu variant="inline" />
        <div className="w-full max-w-[1440px] mx-auto flex justify-end items-center text-sm text-gray-900 gap-6">

          <Link
            to="/event"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <MdEmojiEvents size={20} /> 이벤트
          </Link>

          {isSignIn && (
            <Link
              to="/mypage"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FaUser /> 마이페이지
            </Link>
          )}

          {isSignIn && (
            <button
              onClick={toggleNotifications}
              className="flex items-center gap-1 hover:text-blue-600 relative"
            >
              <FaBell />
              <span>알림</span>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          )}
        </div>

        {/* 알림 패널 */}
        {isSignIn && (
          <NotificationPopover
            isOpen={isNotificationOpen}
            notificationList={notificationList}
            onRead={handleNotificationRead}
          />
        )}
      </div>
    </div>
  );
}
