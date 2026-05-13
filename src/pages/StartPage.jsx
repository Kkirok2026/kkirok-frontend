import { Link } from "react-router-dom";

export default function StartPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F4F7F2]">
      <h1 className="text-4xl font-bold text-green-700 mb-3">끼록</h1>
      <p className="text-sm text-neutral-600 mb-8">
        나에게 맞는 식단을 기록하고 추천받아요
      </p>

      <Link
        to="/login"
        className="w-full max-w-xs py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
      >
        시작하기
      </Link>
    </div>
  );
}