import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAccessToken } from "../../utils/tokenUtils";
import api from "../../services/api";

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

  const fetchMemberInfo = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const res = await api.get<ApiResponse<MemberInfo>>("/api/v1/mypage", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      setMemberInfo(res.data.data);
    } catch (error) {
      console.error("회원 정보 조회 실패", error);
    }
  };

  useEffect(() => {
    fetchMemberInfo();
  }, []);

  return (
    <div className="profile-section">
      <div className="profile-image">
        <img src={memberInfo?.img || "/default-avatar.png"} alt="프로필" />
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
