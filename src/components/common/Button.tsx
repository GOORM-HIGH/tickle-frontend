import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "small" | "normal" | "large";
    children: React.ReactNode;
}

const sizeClasses = {
    small: "w-40 h-11",    // 160 x 44
    normal: "w-64 h-11",   // 256 x 44
    large: "w-[460px] h-11", // 460 x 44
};

const Button: React.FC<ButtonProps> = ({ size = "normal", children, ...props }) => {
    return (
        <button
            {...props}
            className={`
                bg-[#006ff5] text-white font-bold rounded 
                ${sizeClasses[size]}
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-blue-700
                transition-colors duration-200 ease-in-out
            `}
            style={{ fontFamily: "GmarketSansMedium, sans-serif" }}
        >
            <span className="w-full h-full flex justify-center items-center text-base">
                {children}
            </span>
        </button>
    );
};

export default Button;
