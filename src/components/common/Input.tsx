import React from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    variant?: "small" | "normal" | "large";
}

const sizeClasses = {
    small: "w-40 h-11",    // 160 x 44
    normal: "w-64 h-11",   // 256 x 44
    large: "w-[460px] h-11", // 460 x 44
};

const Input: React.FC<InputProps> = ({ variant = "normal", ...props }) => {
    return (
        <input
            {...props}
            className={`
                border border-gray-300 rounded 
                px-3 text-base
                placeholder-gray-400
                focus:outline-none focus:border-[#006ff5]
                ${sizeClasses[variant]}
            `}
            style={{ fontFamily: "NEXON Lv1 Gothic OTF, sans-serif" }}
        />
    );
};

export default Input;
