// src/pages/mypage/MyInfo.tsx
import { useEffect, useState } from "react";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";

import AuthCard from "../../../components/member/AuthCard";
import ProfileImageUploader from "../../../components/member/ProfileImageUploader";
import AuthInput from "../../../components/member/AuthInput";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";

import {
  validateNickName,
  validateContractCharge,
} from "../../../utils/validations";

const bankList: string[] = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
];
const chargeList: number[] = [0, 5, 10, 15, 20];

export default function InfoTab() {
  const [formData, setFormData] = useState<MemberInfo>({
    email: "",
    nickname: "",
    pointBalance: 0,
    img: "",
    hostBizName: "",
    hostBizBank: "",
    hostBizDepositor: "",
    hostBizBankNumber: "",
    contractCharge: 0,
    memberRole: "MEMBER",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({ nickname: "" });

  // 회원 정보 조회
  const fetchMemberInfo = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const res = await api.get<ApiResponse<MemberInfo>>("/api/v1/mypage", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      setFormData(res.data.data);
    } catch (error) {
      console.error("회원 정보 조회 실패", error);
    }
  };

  useEffect(() => {
    fetchMemberInfo();
  }, []);

  // 입력 핸들러 (수수료율은 숫자 캐스팅)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "contractCharge") {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });

    if (name === "nickname") {
      setErrors((prev) => ({
        ...prev,
        nickname: value ? "" : "닉네임을 입력해주세요.",
      }));
    }
  };

  // 프로필 이미지 업로드 (선택된 경우에만)
  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage) return null;
    const data = new FormData();
    data.append("file", profileImage);
    try {
      const res = await api.post<ApiResponse<{ url: string }>>(
        "/api/v1/upload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      return res.data.data.url;
    } catch (e) {
      console.error("이미지 업로드 실패", e);
      alert("이미지 업로드에 실패했습니다.");
      return null;
    }
  };

  // 저장: 닉네임 + (HOST이면 수수료율) + (선택 이미지)만 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    // 닉네임 검증
    const nicknameError = validateNickName(formData.nickname);
    if (nicknameError) {
      setErrors((prev) => ({ ...prev, nickname: nicknameError }));
      return;
    }

    // HOST 전용: 수수료율 검증
    if (formData.memberRole === "HOST") {
      const chargeError = validateContractCharge(
        Number(formData.contractCharge)
      );
      if (chargeError) {
        alert(chargeError);
        return;
      }
    }

    setIsSaving(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      // (선택) 새 이미지 업로드
      const uploadedUrl = await uploadProfileImage();

      // 전송 페이로드 (오직 닉네임/수수료율/이미지)
      const payload: UpdateMemberRequest = {
        nickname: formData.nickname.trim(),
        img: uploadedUrl ?? undefined,
      };
      if (formData.memberRole === "HOST") {
        const chargeNum = Number(formData.contractCharge);
        if (!Number.isNaN(chargeNum)) payload.charge = chargeNum;
      }

      // ✅ 백엔드 사양에 맞춰 PathVariable로 이메일 전달
      await api.post<ApiResponse<void>>(
        `/api/v1/members/${encodeURIComponent(formData.email)}`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );

      alert("저장되었습니다.");
      await fetchMemberInfo();
      setProfileImage(null);
    } catch (error: any) {
      console.error("회원 정보 저장 실패", error?.response?.data || error);
      // 서버 메시지 노출(가능할 때)
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "저장 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto mt-0">
      <AuthCard title="회원정보" minWidth="1000px">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6"
        >
          {/* 프로필 이미지 (수정 가능) */}
          <ProfileImageUploader
            imageUrl={
              profileImage
                ? URL.createObjectURL(profileImage)
                : formData.img || undefined
            }
            onChange={(file) => setProfileImage(file)}
          />

          <div className="flex flex-col gap-4">
            {/* 읽기 전용 */}
            <AuthInput
              label="이메일"
              variant="large"
              value={formData.email}
              readOnly
            />
            <AuthInput
              label="보유 포인트"
              variant="large"
              value={`${formData.pointBalance.toLocaleString()} P`}
              readOnly
            />
            {formData.hostBizName && (
              <AuthInput
                label="사업자명"
                variant="large"
                value={formData.hostBizName}
                readOnly
              />
            )}

            {/* 닉네임 (수정 가능) */}
            <AuthInput
              label="닉네임"
              name="nickname"
              variant="large"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              error={errors.nickname}
            />

            {/* HOST 전용: 보기만 가능(수정 불가) + 수수료율(수정 가능) */}
            {formData.memberRole === "HOST" && (
              <>
                <Select
                  label="은행"
                  name="hostBizBank"
                  value={formData.hostBizBank}
                  onChange={handleChange}
                  options={[
                    { label: "선택", value: "" },
                    ...bankList.map((b) => ({ label: b, value: b })),
                  ]}
                  disabled
                />

                <AuthInput
                  label="예금주"
                  name="hostBizDepositor"
                  variant="large"
                  placeholder="예금주"
                  value={formData.hostBizDepositor}
                  onChange={handleChange}
                  readOnly
                />

                <AuthInput
                  label="계좌번호"
                  name="hostBizBankNumber"
                  variant="large"
                  placeholder="계좌번호"
                  value={formData.hostBizBankNumber}
                  onChange={handleChange}
                  readOnly
                />

                {/* 수수료율만 수정 가능 */}
                <Select
                  label="수수료율"
                  name="contractCharge"
                  value={formData.contractCharge}
                  onChange={handleChange}
                  options={chargeList.map((c) => ({
                    label: `${c}%`,
                    value: c,
                  }))}
                />
              </>
            )}

            <Button size="large" type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
