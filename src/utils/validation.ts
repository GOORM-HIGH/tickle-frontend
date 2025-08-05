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


export const validateName = (name: string) => {
  if (!name) return "사용자 이름은 필수입니다.";
  if (name.length < 3 || name.length > 20)
    return "사용자 이름은 3~20자 사이여야 합니다.";
  if (!/^[A-Za-z0-9가-힣]+$/.test(name))
    return "사용자 이름은 한글, 영문자, 숫자만 포함해야 합니다.";
};
