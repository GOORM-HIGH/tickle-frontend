import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../common/Logo";
import SearchBar from "../../common/SearchBar";
import AuthMenu from "../../common/header/AuthMenu";
import FeatureMenu from "../../common/header/FeatureMenu";
import GenreMenu from "../../common/header/GenreMenu";
import { getAccessToken, removeTokens } from "../../../utils/tokenUtils";
import { connect } from "../../../utils/realtimeUtils";

export default function Header() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);
  const [shouldRefreshNotificationList, setShouldRefreshNotificationList] =
    useState(false);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(
        `/performance/search?keyword=${encodeURIComponent(
          searchKeyword.trim()
        )}`
      );
    }
  };

  const handleSignOut = () => {
    removeTokens();
    setIsSignIn(false);
    navigate("/");
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    setIsSignIn(true);

    const eventSource = connect({
      onMessage: (msg: RealtimeNotification) => {
        console.log("실시간 알림이 수신되었습니다.");
        setShouldRefreshNotificationList(true);
      },
      onError: (err) => {
        console.error("서버와 실시간 통신 중 오류가 발생했습니다\n", err);
      },
    });

    return () => {
      eventSource.close();
      console.log("실시간 통신 종료");
    };
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 header-container">
      <div className="max-w-full mx-auto px-8 py-4 flex items-center justify-between">
        <Logo />
        <SearchBar
          keyword={searchKeyword}
          onChange={setSearchKeyword}
          onSubmit={handleSearch}
        />
        <AuthMenu isSignIn={isSignIn} onSignOut={handleSignOut} />
      </div>

      <FeatureMenu
        isSignIn={isSignIn}
        shouldRefreshNotificationList={shouldRefreshNotificationList}
        onNotificationRefreshed={() => {
          setShouldRefreshNotificationList(false);
        }}
      />

      <GenreMenu />
    </header>
  );
}
