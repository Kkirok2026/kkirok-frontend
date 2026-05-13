import { Link } from "react-router-dom";

export default function SignupGoalPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      <h1 className="text-2xl font-bold mb-2">목표 설정</h1>
      <p className="text-sm text-neutral-500 mb-8">
        원하는 목표를 입력해주세요.
      </p>

      <div className="space-y-4">
        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="목표 몸무게 kg"
        />

        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="목표 기간 예: 3개월"
        />

        <Link
          to="/home"
          className="block w-full py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}