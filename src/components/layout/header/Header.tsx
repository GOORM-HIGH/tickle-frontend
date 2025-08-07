import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../common/Logo";
import SearchBar from "../../common/SearchBar";
import AuthMenu from "../../common/header/AuthMenu";
import FeatureMenu from "../../common/header/FeatureMenu";
import GenreMenu from "../../common/header/GenreMenu";

export default function Header() {
  const [searchKeyword, setSearchKeyword] = useState("");
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

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-full mx-auto px-8 py-4 flex items-center justify-between">
        <Logo />
        <SearchBar
          keyword={searchKeyword}
          onChange={setSearchKeyword}
          onSubmit={handleSearch}
        />
        <AuthMenu />
      </div>
      <FeatureMenu />
      <GenreMenu />
    </header>
  );
}
