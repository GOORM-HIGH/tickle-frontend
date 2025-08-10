import { useEffect, useState } from "react";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";

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

  const fetchMemberInfo = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      // ✅ 응답이 { status, message, data } 래핑이면:
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

  return (
    <>
      <h1>MyInfo Component</h1>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
}
