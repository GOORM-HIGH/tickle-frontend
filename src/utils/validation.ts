export const validateEmail = (email: string) => {
  if (!email) return "이메일은 필수입니다.";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    return "유효한 이메일 주소를 입력하세요.";
  return ""; // 유효하면 에러 메시지 없음
};

export const validatePassword = (password: string) => {
  if (!password) return "비밀번호는 필수입니다.";
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (password.length > 20) return "비밀번호는 20자 이하여야 합니다.";
  if (!/[A-Za-z]/.test(password))
    return "비밀번호에는 최소한 하나의 영문자가 포함되어야 합니다.";
  if (!/[0-9]/.test(password))
    return "비밀번호에는 최소한 하나의 숫자가 포함되어야 합니다.";
  //   if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
  //     return "비밀번호에는 최소한 하나의 특수문자가 포함되어야 합니다.";
};

export const validateNickName = (name: string) => {
  if (!name) return "사용자 별칭은 필수입니다.";
  if (name.length < 3 || name.length > 10)
    return "사용자 이름은 3~10자 사이여야 합니다.";
  if (!/^[A-Za-z0-9가-힣]+$/.test(name))
    return "사용자 이름은 한글, 영문자, 숫자만 포함해야 합니다.";
};

export const validateEmailCode = (code: string): string | null => {
  if (!code) return "인증코드를 입력해주세요.";
  if (!/^[A-Za-z0-9]{12}$/.test(code))
    return "인증코드는 영어와 숫자로 이루어진 12자리여야 합니다.";
  return null;
};

// 사업자등록번호 (10자리 숫자)
export const validateBizNumber = (bizNumber: string): string | null => {
  const regex = /^\d{10}$/; // 정확히 10자리 숫자
  if (!bizNumber) return "사업자등록번호를 입력해주세요.";
  if (!regex.test(bizNumber)) return "사업자등록번호는 10자리 숫자여야 합니다.";
  return null;
};

// 사업자명 (2~50자)
export const validateBizName = (bizName: string): string | null => {
  if (!bizName) return "사업자명을 입력해주세요.";
  if (bizName.length < 2 || bizName.length > 50) return "사업자명은 2자 이상 50자 이하로 입력해주세요.";
  return null;
};

// 통신판매업 신고번호 (형식 예시: 2023-서울강남-12345)
export const validateEcommerceNumber = (ecomNumber: string): string | null => {
  const regex = /^\d{4}-[가-힣A-Za-z]+-\d+$/;
  if (!ecomNumber) return "통신판매업 신고번호를 입력해주세요.";
  if (!regex.test(ecomNumber)) return "형식은 예: 2023-서울강남-12345 로 입력해주세요.";
  return null;
};

