import React from "react";

interface AuthSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { label: string; value: string | number }[];
    error?: string;
}

const Select: React.FC<AuthSelectProps> = ({ label, options, error, ...props }) => {
    return (
        <div className="flex flex-col w-[460px]">
            {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
            <select
                {...props}
                className={`border border-gray-300 rounded px-3 text-base h-11 focus:outline-none focus:border-[#006ff5]`}
                style={{ fontFamily: "NEXON Lv1 Gothic OTF, sans-serif" }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
};

export default Select;
