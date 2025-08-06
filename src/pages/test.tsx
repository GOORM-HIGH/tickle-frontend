import React, { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProfileImageUploader from "../components/member/ProfileImageUploader";
import AuthCard from "../components/member/AuthCard";

const TestButtonPage: React.FC = () => {
    const [profileImage, setProfileImage] = useState<File | null>(null);

    return (
        <AuthCard title="회원가입">
            <div className="flex flex-col items-center gap-6"> {/* 세로 배치 */}
                {/* 맨 위: 프로필 업로더 */}
                <ProfileImageUploader
                    imageUrl={profileImage ? URL.createObjectURL(profileImage) : undefined}
                    onChange={(file) => setProfileImage(file)}
                />

                {/* 입력칸 + 버튼 */}
                <div className="flex flex-col gap-4">
                    <Input variant="large" placeholder="이메일" />
                    <div className="flex justify-between w-[460px] gap-2">
                        <Input variant="large" placeholder="이메일 인증" className="flex-grow" />
                        <Button size="small">인증번호 전송</Button>
                    </div>
                    <Input variant="large" placeholder="비밀번호" />
                    <Input variant="large" placeholder="비밀번호 확인" />
                    <Input variant="large" placeholder="생년월일" />
                    <Input variant="large" placeholder="닉네임" />
                    <Button size="large">회원가입</Button>
                </div>
            </div>
        </AuthCard>
    );
};

export default TestButtonPage;
