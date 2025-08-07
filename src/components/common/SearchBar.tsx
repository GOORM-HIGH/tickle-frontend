import { FaSearch } from "react-icons/fa";

interface Props {
  keyword: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchBar({ keyword, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex-1 mx-8 ml-4 relative max-w-[800px]"
    >
      <input
        type="text"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
        placeholder="어떤 공연을 찾으시나요?"
        style={{ fontFamily: "NEXON Lv1 Gothic OTF, sans-serif" }}
        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-gray-100 text-sm text-black focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
      >
        <FaSearch />
      </button>
    </form>
  );
}
