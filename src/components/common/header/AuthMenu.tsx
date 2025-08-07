import { Link } from "react-router-dom";

interface AuthMenuProps {
  isSignIn: boolean;
  onSignOut: () => void;
}

export default function AuthMenu({ isSignIn, onSignOut }: AuthMenuProps) {
  if (isSignIn) {
    return (
      <button
        onClick={onSignOut}
        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-medium hover:bg-gray-50"
      >
        로그아웃
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <Link to="/auth/sign-up">
        <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-medium hover:bg-gray-50">
          회원가입
        </button>
      </Link>
      <Link to="/auth/sign-in">
        <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-medium hover:bg-gray-50">
          로그인
        </button>
      </Link>
    </div>
  );
}
