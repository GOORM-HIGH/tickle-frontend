import { useEffect, useState } from "react";
import { FaBell, FaUser, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";
import NotificationPopover from "../../notification/NotificationPopover";

export default function FeatureMenu() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<
    NotificationResponse[]
  >([]);

  // 알림 토글
  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  // 알림 읽음 핸들러
  const handleNotificationRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // 알림 불러오기
  useEffect(() => {
    const accessToken = getAccessToken();
    console.log("accessToken:", accessToken);
    if (!accessToken) return;

    const fetchNotificationList = async () => {
      try {
        const response = await api.get("/api/v1/notifications", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
        console.log("🔔 알림 조회 성공");
        const formatted = response.data.data.map((item: any) => ({
          ...item,
          isRead: item.read,
        }));
        setNotificationList(formatted);

        console.log(response.data.data);
      } catch (error) {
        console.error("❌ 알림 API 조회 실패:", error);
      }
    };

    fetchNotificationList();
  }, []);

  // 읽지 않은 알림이 하나라도 있는지
  const hasUnread = notificationList.some((n) => !n.isRead);

  return (
    <div className="relative bg-gradient-to-r from-white to-[#f9fbff] border-t border-gray-100 px-8 py-3">
      <div className="max-w-[1440px] mx-auto flex justify-end items-center text-sm text-gray-900 gap-6">
        <Link
          to="/events"
          className="flex items-center gap-1 hover:text-blue-600"
        >
          <FaTicketAlt /> 쿠폰
        </Link>
        <Link
          to="/event-ticket"
          className="flex items-center gap-1 hover:text-blue-600"
        >
          🎉 이벤트
        </Link>
        <Link
          to="/mypage"
          className="flex items-center gap-1 hover:text-blue-600"
        >
          <FaUser /> 마이페이지
        </Link>
        <button
          onClick={toggleNotifications}
          className="hover:text-blue-600 relative"
        >
          <FaBell />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>
      {/* 알림 패널 */}
      <NotificationPopover
        isOpen={isNotificationOpen}
        notificationList={notificationList}
        onRead={handleNotificationRead}
      />
    </div>
  );
}
