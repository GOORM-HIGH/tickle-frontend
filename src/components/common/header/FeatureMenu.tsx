import { Link } from "react-router-dom";
import { FaBell, FaUser, FaTicketAlt } from "react-icons/fa";

export default function FeatureMenu() {
  return (
    <div className="bg-gradient-to-r from-white to-[#f9fbff] border-t border-gray-100 px-8 py-3">
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
        <Link to="/notifications" className="hover:text-blue-600">
          <FaBell />
        </Link>
      </div>
    </div>
  );
}
