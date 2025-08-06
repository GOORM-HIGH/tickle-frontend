import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, error, ...props }) => {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                {...props}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${error ? "border-red-500" : "border-gray-300"}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default TextInput;
