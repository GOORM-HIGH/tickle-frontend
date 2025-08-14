import Cookies from "js-cookie";

export const setAccessToken = (token: string) => {
  Cookies.set("accessToken", token, {
    secure: true, // 🎯 localhost에서는 false로 설정
    sameSite: "None", // 🎯 localhost에서는 Lax로 설정
    expires: 1 / 24, // 1시간
  });
};

export const getAccessToken = () => Cookies.get("accessToken");

export const removeTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userInfo");
};

// 사용자 정보 관리 함수들
export const setUserInfo = (userInfo: string) => {
  Cookies.set("userInfo", userInfo, {
    secure: true,
    sameSite: "Strict",
    expires: 7, // 7일
  });
};

export const getUserInfo = () => Cookies.get("userInfo");

export const removeUserInfo = () => {
  Cookies.remove("userInfo");
};
