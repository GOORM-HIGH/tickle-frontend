export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => localStorage.getItem("accessToken");

export const removeTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
};

// 사용자 정보 관리 함수들
export const setUserInfo = (userInfo: string) => {
  localStorage.setItem("userInfo", userInfo);
};

export const getUserInfo = () => localStorage.getItem("userInfo");

export const removeUserInfo = () => {
  localStorage.removeItem("userInfo");
};
