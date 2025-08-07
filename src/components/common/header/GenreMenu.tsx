import { Link } from "react-router-dom";
import { PERFORMANCE_GENRES } from "../../../home/constants/categories";

export default function GenreMenu() {
  return (
    <div className="bg-gray-100 border-t border-gray-200 px-8 py-3">
      <div className="max-w-[1440px] mx-auto">
        <nav className="flex gap-4 items-center flex-wrap justify-center">
          {PERFORMANCE_GENRES.map((genre) => (
            <Link
              key={genre.id}
              to={`/performance/${genre.id}`}
              className="px-3 py-1.5 rounded-full text-sm text-gray-800 hover:bg-blue-100 hover:text-blue-600 transition whitespace-nowrap"
            >
              {genre.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
