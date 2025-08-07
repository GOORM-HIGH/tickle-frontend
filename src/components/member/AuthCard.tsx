import React from "react";

interface AuthCardProps {
    title?: string; // 카드 상단 제목
    children: React.ReactNode; // 내부 내용
    minWidth?: string; // 최소 너비 (예: "600px")
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children, minWidth = "500px" }) => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div
                className="bg-white rounded-xl shadow-md p-8"
                style={{
                    minWidth, // 기본값 500px, props로 덮어쓰기 가능
                }}
            >
                {title && <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>}
                {children}
            </div>
        </div>
    );
};

export default AuthCard;
