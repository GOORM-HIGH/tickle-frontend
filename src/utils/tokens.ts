import Cookies from "js-cookie";

export const setAccessToken = (token: string) => {
  Cookies.set("accessToken", token, {
    secure: true,
    sameSite: "Strict",
    expires: 1 / 24, // 1시간
  });
};

export const getAccessToken = () => Cookies.get("accessToken");

export const removeTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};
