import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAccessToken } from "../../../utils/tokenUtils.ts";
import api from "../../../services/api.ts";

interface ProfileSectionProps {
  currentBalance: number;
  onChargeClick: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentBalance,
  onChargeClick,
}) => {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMemberInfo = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) return;

        const res = await api.get<ApiResponse<MemberInfo>>("/api/v1/mypage", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        if (mounted) setMemberInfo(res?.data?.data ?? null);
      } catch (error) {
        console.error("회원 정보 조회 실패", error);
      }
    };

    fetchMemberInfo();
    return () => {
      mounted = false;
    };
  }, []);

  // 안전한 포인트 값
  const safePoint =
    typeof memberInfo?.pointBalance === "number"
      ? memberInfo.pointBalance
      : typeof currentBalance === "number"
      ? currentBalance
      : 0;

  const avatarSrc =
    memberInfo?.img && memberInfo.img.trim() !== ""
      ? memberInfo.img
      : "/default-avatar.png";

  return (
    <div className="text-center px-6 py-10 rounded-2xl bg-[#f8fafc] relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      {/* 상단 그라데이션 라인 */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,#3682F7,#60a5fa,#3b82f6)] rounded-t-[24px]" />

      {/* 프로필 이미지 */}
      <div className="w-[110px] h-[110px] rounded-full mx-auto mb-8 overflow-hidden border-[5px] border-white shadow-[0_12px_40px_rgba(54,130,247,0.15)] bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] transition-transform duration-300 hover:scale-[1.05] hover:shadow-[0_16px_50px_rgba(54,130,247,0.25)] relative">
        <img
          src={avatarSrc}
          alt="프로필"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
        <div className="pointer-events-none absolute inset-[-2px] rounded-full -z-10 bg-[linear-gradient(45deg,#3682F7,#60a5fa)]" />
      </div>

      {/* 닉네임 */}
      <h3 className="text-[1.4rem] font-bold m-0 mb-5 tracking-[-0.02em] bg-gradient-to-br from-[#1e293b] to-[#334155] bg-clip-text text-transparent">
        {memberInfo?.nickname ?? "-"}
      </h3>

      {/* 포인트 박스 */}
      <div className="bg-white rounded-2xl p-6 mb-6 relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(90deg,#3682F7,#60a5fa,#3b82f6)]" />
        <span className="block text-sm font-medium text-[#64748b] mb-2">
          보유 포인트
        </span>
        <span className="block text-[1.5rem] font-bold text-[#1e293b]">
          {Number(safePoint).toLocaleString()} P
        </span>
      </div>

      {/* 충전 버튼 */}
      <button
        type="button"
        onClick={onChargeClick}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold text-white bg-[linear-gradient(135deg,#3682F7_0%,#60a5fa_100%)] shadow-[0_6px_20px_rgba(54,130,247,0.25)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(54,130,247,0.35)] hover:bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_100%)] relative overflow-hidden"
      >
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-transform duration-500 hover:translate-x-full" />
        <Plus size={16} />
        포인트 충전
      </button>
    </div>
  );
};

export default ProfileSection;
