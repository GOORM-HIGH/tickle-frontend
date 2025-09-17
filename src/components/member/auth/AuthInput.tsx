import React from "react";

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    error?: string;
    variant?: "small" | "normal" | "large";
}

const sizeClasses = {
    small: "w-40 h-11",
    normal: "w-64 h-11",
    large: "w-[460px] h-11",
};

const AuthInput: React.FC<AuthInputProps> = ({ label, error, variant = "normal", className, ...props }) => {
    return (
        <div className={`flex flex-col ${className || ""}`}>
            {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
            <input
                {...props}
                className={`
                    border border-gray-300 rounded px-3 text-base
                    focus:outline-none focus:border-[#006ff5]
                    ${sizeClasses[variant]}
                `}
                style={{ fontFamily: "NEXON Lv1 Gothic OTF, sans-serif" }}
            />
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
};

export default AuthInput;
