import React from "react";
import { useAuth } from "../../../hooks/useAuth";

type UserRole = "USER" | "HOST" | "ADMIN";

interface MyPageCardProps {
  title?: string;
  children: React.ReactNode;
  minWidth?: string;

  // 추가: 배치/높이/클래스 제어
  centered?: boolean; // 가운데 정렬 여부 (기본 true)
  fullHeight?: boolean; // min-h-screen 적용 여부 (기본 true)
  containerClassName?: string; // 컨테이너에 추가 Tailwind
  cardClassName?: string; // 카드에 추가 Tailwind
  // ✅ 추가: 이 카드 자체를 볼 수 있는 역할
  visibleFor?: UserRole[];
  // ✅ 추가: 권한 없을 때 대체 UI (없으면 아무것도 렌더 안 함)
  fallbackWhenHidden?: React.ReactNode;
}

const normalizeRole = (raw?: string): UserRole | undefined => {
  if (!raw) return undefined;
  const r = raw.replace(/^ROLE_/, "").toUpperCase();
  return (["USER", "HOST", "ADMIN"] as const).includes(r as UserRole)
    ? (r as UserRole)
    : undefined;
};


const MyPageCard: React.FC<MyPageCardProps> = ({
  title,
  children,
  minWidth = "500px",
  centered = true,
  fullHeight = true,
  containerClassName = "",
  cardClassName = "",
  visibleFor,                // ✅
  fallbackWhenHidden = null, // ✅

}) => {

  const { currentUser } = useAuth();
  const role = normalizeRole(currentUser?.role);

  // ✅ 역할 제한이 있고, 내 역할이 허용되지 않으면 렌더링 차단
  if (visibleFor && (!role || !visibleFor.includes(role))) {
    return <>{fallbackWhenHidden}</>;
  }

  const containerBase = "flex justify-center bg-gray-50";
  const vertical = centered ? "items-center" : "items-start";
  const height = fullHeight ? "min-h-screen" : "";

  return (
    <div
      className={`${containerBase} ${vertical} ${height} ${containerClassName}`}
    >
      <div
        className={`bg-white rounded-xl shadow-md p-8 ${cardClassName}`}
        style={{ minWidth }}
      >
        {title && (
          <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
        )}
        {children}
      </div>
    </div>
  );
};

export default MyPageCard;
