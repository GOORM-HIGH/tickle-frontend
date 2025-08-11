import React from 'react';
import { Plus } from 'lucide-react';

interface ProfileSectionProps {
  currentBalance: number;
  onChargeClick: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ currentBalance, onChargeClick }) => {
  return (
    <div className="profile-section">
      <div className="profile-image">
        <img src="/logo.png" alt="프로필" />
      </div>
      <div className="profile-info">
        <h3 className="user-name">사용자님</h3>
        <div className="point-balance">
          <span className="point-label">보유 포인트</span>
          <span className="point-amount">{currentBalance.toLocaleString()} P</span>
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
