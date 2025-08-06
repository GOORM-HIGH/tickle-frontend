import React from "react";

interface AuthCardProps {
    title?: string; // 카드 상단 제목
    children: React.ReactNode; // 내부 내용
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
                {title && <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>}
                {children}
            </div>
        </div>
    );
};

export default AuthCard;
