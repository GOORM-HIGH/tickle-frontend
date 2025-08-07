import { useEffect, useState } from "react";
import { FaBell, FaUser, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";
import NotificationPopover from "../../notification/NotificationPopover";

export default function FeatureMenu() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notificationList, setNotificationList] = useState<
    NotificationResponse[] | null
  >(null);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const fetchNotifications = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await api.get("/api/v1/notifications");
      setNotificationList(response.data.data);
    } catch (error) {
      console.error("알림 API 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
        </button>
      </div>

      {/* 알림 패널 */}
      <NotificationPopover
        isOpen={isNotificationOpen}
        notificationList={notificationList}
      />
    </div>
  );
}
