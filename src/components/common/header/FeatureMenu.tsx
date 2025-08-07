import { useEffect, useState } from "react";
import { FaBell, FaUser, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";
import NotificationPopover from "../../notification/NotificationPopover";

export default function FeatureMenu({ isSignIn }: { isSignIn: boolean }) {
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

  useEffect(() => {
    if (!isSignIn) return;

    const accessToken = getAccessToken();
    if (!accessToken) return;

    const fetchNotificationList = async () => {
      try {
        const response = await api.get("/api/v1/notifications", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
        const formatted = response.data.data.map((item: any) => ({
          ...item,
          isRead: item.read,
        }));
        setNotificationList(formatted);
      } catch (error) {
        console.error("❌ 알림 API 조회 실패:", error);
      }
    };

    fetchNotificationList();
  }, [isSignIn]);

  const hasUnread = notificationList.some((n) => !n.isRead);

  return (
    <div className="relative bg-gradient-to-r from-white to-[#f9fbff] border-t border-gray-100 px-8 py-3">
      <div className="w-full max-w-[1440px] mx-auto flex justify-end items-center text-sm text-gray-900 gap-6">
        {isSignIn && (
          <>
            <Link
              to="/events"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FaTicketAlt /> 쿠폰
            </Link>
          </>
        )}

        <Link
          to="/event-ticket"
          className="flex items-center gap-1 hover:text-blue-600"
        >
          🎉 이벤트
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
  );
}
