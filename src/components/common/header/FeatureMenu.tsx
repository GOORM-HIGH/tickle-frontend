import { useState } from "react";
import { FaBell, FaUser, FaTicketAlt, FaMusic } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PERFORMANCE_GENRES } from "../../../home/constants/categories";

export default function FeatureMenu() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  return (
    <div className="relative bg-gradient-to-r from-white to-[#f9fbff] border-t border-gray-100 px-8 py-3">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center text-sm text-gray-900">
        {/* 왼쪽: 장르 메뉴 */}
        <div className="flex items-center gap-2">
          {PERFORMANCE_GENRES.map((genre) => (
            <Link
              key={genre.id}
              to={`/performance/${genre.id}`}
              className="px-2 py-1 text-xs text-gray-700 hover:text-blue-600 transition whitespace-nowrap"
            >
              {genre.name}
            </Link>
          ))}
        </div>

        {/* 오른쪽: 기타 메뉴들 */}
        <div className="flex items-center gap-6">
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
      </div>



      {/* 알림 패널 */}
      {isNotificationOpen && (
        <div className="absolute right-8 top-[60px] w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 text-sm">
          <p className="text-gray-800 font-semibold mb-2">🔔 알림</p>
          <ul className="space-y-2">
            <li className="text-gray-600">새로운 쿠폰이 발급되었습니다.</li>
            <li className="text-gray-600">예매한 공연의 시간이 다가옵니다.</li>
            <li className="text-gray-600">공지사항을 확인해주세요.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
