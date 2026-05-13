import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      <h1 className="text-2xl font-bold mb-2">로그인</h1>
      <p className="text-sm text-neutral-500 mb-8">
        끼록에 오신 걸 환영합니다.
      </p>

      <div className="space-y-4">
        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="이메일"
        />

        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="비밀번호"
          type="password"
        />

        <Link
          to="/home"
          className="block w-full py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
        >
          로그인
        </Link>

        <Link
          to="/signup"
          className="block text-center text-sm text-green-700"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}