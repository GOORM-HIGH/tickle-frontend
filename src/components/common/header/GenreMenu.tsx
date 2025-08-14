import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { performanceApi, GenreDto } from "../../../home/api/performanceApi";

interface GenreMenuProps {
  variant?: 'dropdown' | 'inline';
}

export default function GenreMenu({ variant = 'dropdown' }: GenreMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [genres, setGenres] = useState<GenreDto[]>([]);
  const [loading, setLoading] = useState(true);

  // 장르 목록을 API에서 가져오기
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        console.log('장르 목록을 가져오는 중...');
        const response = await performanceApi.getGenres();
        console.log('API 응답:', response);
        if (response.data) {
          console.log('장르 데이터:', response.data);
          setGenres(response.data);
        } else {
          console.log('응답에 data가 없습니다:', response);
        }
      } catch (error) {
        console.error('장르 목록을 가져오는데 실패했습니다:', error);
        // 에러 발생 시 빈 배열로 설정
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="text-xs text-gray-500">로딩 중...</div>
        ) : genres.length > 0 ? (
          genres.map((genre) => (
            <Link
              key={genre.genreId}
              to={`/performance/genre/${genre.genreId}`}
              className="px-2 py-1 text-xs text-gray-700 hover:text-blue-600 transition whitespace-nowrap"
            >
              {genre.title}
            </Link>
          ))
        ) : (
          <div className="text-xs text-gray-500">장르 목록을 불러올 수 없습니다.</div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* 장르 메뉴가 나타날 공간 (투명) */}
      {isVisible && (
        <div className="bg-gray-100 border-t border-gray-200 px-8 py-3">
          <div className="max-w-[1440px] mx-auto">
            <nav className="flex gap-4 items-center flex-wrap justify-center">
              {loading ? (
                <div className="text-sm text-gray-500">장르 목록 로딩 중...</div>
              ) : genres.length > 0 ? (
                genres.map((genre) => (
                  <Link
                    key={genre.genreId}
                    to={`/performance/genre/${genre.genreId}`}
                    className="px-3 py-1.5 rounded-full text-sm text-gray-800 hover:bg-blue-100 hover:text-blue-600 transition whitespace-nowrap"
                  >
                    {genre.title}
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500">장르 목록을 불러올 수 없습니다.</div>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
