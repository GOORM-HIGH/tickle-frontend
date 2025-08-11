import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAccessToken } from "../../utils/tokenUtils";
import api from "../../services/api";

interface MemberInfo {
  email: string;
  nickname: string;
  pointBalance: number;
  img: string;
  hostBizName: string;
  hostBizBank: string;
  hostBizDepositor: string;
  hostBizBankNumber: string;
  contractCharge: number;
  memberRole: "MEMBER" | "HOST" | string;
}

interface ApiResponse<T> {
  data: T;
}

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
    let ignore = false;

    const fetchMemberInfo = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) return;

        const res = await api.get<ApiResponse<MemberInfo>>("/api/v1/mypage", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        if (!ignore) setMemberInfo(res.data.data);
      } catch (error) {
        console.error("회원 정보 조회 실패", error);
      }
    };

    fetchMemberInfo();
    return () => {
      ignore = true;
    };
  }, []);

  // 프로필 이미지 경로 결정
  const profileImageSrc =
    memberInfo?.img && memberInfo.img.trim() !== ""
      ? memberInfo.img
      : "/default-avatar.png";

  return (
    <div className="profile-section">
      <div className="profile-image">
        <img src={profileImageSrc} alt="프로필" />
      </div>

      <div className="profile-info">
        <h3 className="user-name">{memberInfo?.nickname ?? "-"}</h3>

        <div className="point-balance">
          <span className="point-label">보유 포인트</span>
          <span className="point-amount">
            {(memberInfo?.pointBalance ?? currentBalance).toLocaleString()} P
          </span>
        </div>

        <button className="charge-button" onClick={onChargeClick}>
          <Plus size={16} />
          포인트 충전
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
