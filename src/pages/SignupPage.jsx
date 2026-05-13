import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      <h1 className="text-2xl font-bold mb-2">회원가입</h1>
      <p className="text-sm text-neutral-500 mb-8">
        계정 정보를 입력해주세요.
      </p>

      <div className="space-y-4">
        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="이름"
        />

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
          to="/signup/profile"
          className="block w-full py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
        >
          다음
        </Link>
      </div>
    </div>
  );
}