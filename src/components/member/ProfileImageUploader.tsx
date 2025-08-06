import React, { useRef } from "react";
import Button from "../common/Button";

interface ProfileImageUploaderProps {
    imageUrl?: string;
    onChange: (file: File) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ imageUrl, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <img
                src={imageUrl || "/default-avatar.png"}
                alt="프로필"
                className="w-[120px] h-[120px] rounded-full object-cover border border-gray-300"
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button size="small" onClick={handleButtonClick}>
                사진 업로드
            </Button>
        </div>
    );
};

export default ProfileImageUploader;
