// 공통 응답 래퍼
type ApiResponse<T> = {
  status: number; // 백엔드 스펙에 맞춰 조정
  message?: string;
  data: T;
};

// 역할 Enum
type UserRole = "MEMBER" | "HOST" | "ADMIN";

// 로그인 요청
type SignInRequest = {
  email: string;
  password: string;
};

// 회원가입 요청 (HOST 전용 필드는 선택으로)
type SignUpRequest = {
  email: string;
  password: string;
  birthday: string; // yyyy-MM-dd
  nickname: string;
  img: string;
  phoneNumber: string;
  role: UserRole;

  // HOST 전용
  hostBizNumber?: string;
  hostBizCeoName?: string;
  hostBizName?: string;
  hostBizAddress?: string;
  hostBizEcommerceRegistrationNumber?: string;
  hostBizBankName?: string;
  hostBizDepositor?: string;
  hostBizBankNumber?: string;
  hostContractCharge?: number; // 또는 string (백엔드 BigDecimal이면 string 권장)
};

// ✅ 실제 마이페이지에 보여줄 "유저 정보" 모델 (상태에 저장할 타입)
type MemberInfo = {
  email: string;
  nickname: string;
  pointBalance: number;
  img: string;
  // HOST 전용
  hostBizName?: string;
  hostBizBank?: string;
  hostBizDepositor?: string;
  hostBizBankNumber?: string;
  contractCharge?: number; // 백엔드가 BigDecimal 문자열이면 string | number 로
  memberRole?: UserRole; // 필요하면 추가
};
