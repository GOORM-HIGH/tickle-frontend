import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../common/Logo";
import SearchBar from "../../common/SearchBar";
import AuthMenu from "../../common/header/AuthMenu";
import FeatureMenu from "../../common/header/FeatureMenu";
import GenreMenu from "../../common/header/GenreMenu";
import { getAccessToken, removeTokens } from "../../../utils/tokenUtils";
import { connectSSE } from "../../../utils/connectSSE";

export default function Header() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);
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
    removeTokens(); // accessToken, refreshToken 제거
    setIsSignIn(false);
    navigate("/"); // 홈으로 리디렉션
  };

  const handleSseMessage = (message: string) => {};

  useEffect(() => {
    const token = getAccessToken();

    if (!token) return;

    setIsSignIn(true);
    const eventSource = connectSSE(token, handleSseMessage);

    return () => {
      eventSource.close();
      console.log("🔌 SSE 연결 종료");
    };
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-full mx-auto px-8 py-4 flex items-center justify-between">
        <Logo />
        <SearchBar
          keyword={searchKeyword}
          onChange={setSearchKeyword}
          onSubmit={handleSearch}
        />
        <AuthMenu isSignIn={isSignIn} onSignOut={handleSignOut} />
      </div>
      <FeatureMenu isSignIn={isSignIn}/>
      <GenreMenu />
    </header>
  );
}
