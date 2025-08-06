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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <img
                src={imageUrl || "/default-avatar.png"}
                alt="프로필"
                style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                }}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            <Button size="small" onClick={handleButtonClick}>사진 업로드</Button>
        </div>
    );
};

export default ProfileImageUploader;
