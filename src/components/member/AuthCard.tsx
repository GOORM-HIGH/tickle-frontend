import React from "react";

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
  minWidth?: string;

  // ✅ 추가: 배치/높이/클래스 제어
  centered?: boolean; // 가운데 정렬 여부 (기본 true)
  fullHeight?: boolean; // min-h-screen 적용 여부 (기본 true)
  containerClassName?: string; // 컨테이너에 추가 Tailwind
  cardClassName?: string; // 카드에 추가 Tailwind
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  children,
  minWidth = "500px",
  centered = true,
  fullHeight = true,
  containerClassName = "",
  cardClassName = "",
}) => {
  const containerBase = "flex justify-center bg-gray-50";
  const vertical = centered ? "items-center" : "items-start";
  const height = fullHeight ? "min-h-screen" : ""; // 상단 배치시 false로

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

export default AuthCard;
