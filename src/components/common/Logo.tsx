import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      <img src="/logo.png" alt="Tickle Logo" className="w-9 h-9" />
      <h1
        className="text-3xl font-bold text-gray-900"
        style={{ fontFamily: "GmarketSansMedium, sans-serif" }}
      >
        Ticket Cloud
      </h1>
    </Link>
  );
}
