import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../common/Logo";
import SearchBar from "../../common/SearchBar";
import AuthMenu from "../../common/header/AuthMenu";
import FeatureMenu from "../../common/header/FeatureMenu";
import { getAccessToken, removeTokens } from "../../../utils/tokens";

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

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      setIsSignIn(true);
    }
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
      <FeatureMenu />
    </header>
  );
}
