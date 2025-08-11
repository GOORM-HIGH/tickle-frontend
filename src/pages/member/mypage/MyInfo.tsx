// src/pages/mypage/MyInfo.tsx
import { useEffect, useState } from "react";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";

import AuthCard from "../../../components/member/AuthCard";
import ProfileImageUploader from "../../../components/member/ProfileImageUploader";
import AuthInput from "../../../components/member/AuthInput";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";

const bankList: string[] = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
];
const chargeList: number[] = [0, 5, 10, 15, 20];

export default function MyInfo() {
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
  });

  // 새로 선택한 프로필 이미지(선택 시 업로드용)
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // 간단 에러 상태 (필요한 항목만 유지)
  const [errors, setErrors] = useState({
    nickname: "",
    hostBizDepositor: "",
    hostBizBankNumber: "",
  });

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

  // 공통 변경 핸들러 (수정 가능 항목만 사용할 예정)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // (선택) 간단한 즉시 검증
    if (name === "nickname") {
      setErrors((prev) => ({
        ...prev,
        nickname: value ? "" : "닉네임을 입력해주세요.",
      }));
    }
    if (name === "hostBizDepositor") {
      setErrors((prev) => ({
        ...prev,
        hostBizDepositor: value ? "" : "예금주를 입력해주세요.",
      }));
    }
    if (name === "hostBizBankNumber") {
      setErrors((prev) => ({
        ...prev,
        hostBizBankNumber: value ? "" : "계좌번호를 입력해주세요.",
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

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 간단 검증
    if (!formData.nickname) {
      setErrors((prev) => ({ ...prev, nickname: "닉네임을 입력해주세요." }));
      return;
    }
    if (!formData.hostBizDepositor) {
      setErrors((prev) => ({
        ...prev,
        hostBizDepositor: "예금주를 입력해주세요.",
      }));
      return;
    }
    if (!formData.hostBizBankNumber) {
      setErrors((prev) => ({
        ...prev,
        hostBizBankNumber: "계좌번호를 입력해주세요.",
      }));
      return;
    }

    try {
      // 새 이미지 업로드(선택 시)
      const uploadedUrl = await uploadProfileImage();
      const payload: Partial<MemberInfo> = {
        ...formData,
        img: uploadedUrl ?? formData.img, // 새로 업로드됐다면 교체
      };

      // 백엔드의 업데이트 엔드포인트에 맞게 수정하세요.
      // 예: PUT /api/v1/mypage
      await api.put<ApiResponse<MemberInfo>>("/api/v1/mypage", payload, {
        withCredentials: true,
      });

      alert("저장되었습니다.");
      // 최신 데이터로 갱신
      fetchMemberInfo();
      setProfileImage(null);
    } catch (error) {
      console.error("회원 정보 저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <AuthCard title="회원정보" minWidth="1000px">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        {/* 프로필 이미지 */}
        <ProfileImageUploader
          imageUrl={
            profileImage
              ? URL.createObjectURL(profileImage)
              : formData.img || undefined
          }
          onChange={(file) => setProfileImage(file)}
        />

        <div className="flex flex-col gap-4">
          {/* 읽기 전용 표시 필드들 */}
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

          {/* 수정 가능 필드들 */}
          <AuthInput
            label="닉네임"
            name="nickname"
            variant="large"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            error={errors.nickname}
          />

          <Select
            label="은행"
            name="hostBizBank"
            value={formData.hostBizBank}
            onChange={handleChange}
            options={[
              { label: "선택", value: "" },
              ...bankList.map((b) => ({ label: b, value: b })),
            ]}
          />

          <AuthInput
            label="예금주"
            name="hostBizDepositor"
            variant="large"
            placeholder="예금주"
            value={formData.hostBizDepositor}
            onChange={handleChange}
            error={errors.hostBizDepositor}
          />

          <AuthInput
            label="계좌번호"
            name="hostBizBankNumber"
            variant="large"
            placeholder="계좌번호"
            value={formData.hostBizBankNumber}
            onChange={handleChange}
            error={errors.hostBizBankNumber}
          />

          <Select
            label="수수료율"
            name="contractCharge"
            value={formData.contractCharge}
            onChange={handleChange}
            options={chargeList.map((c) => ({ label: `${c}%`, value: c }))}
          />

          <Button size="large" type="submit">
            저장
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
