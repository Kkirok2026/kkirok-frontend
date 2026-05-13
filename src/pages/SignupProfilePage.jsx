import { Link } from "react-router-dom";

export default function SignupProfilePage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      <h1 className="text-2xl font-bold mb-2">신체 정보 입력</h1>
      <p className="text-sm text-neutral-500 mb-8">
        맞춤 식단 추천을 위해 필요한 정보예요.
      </p>

      <div className="space-y-4">
        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="키 cm"
        />

        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="몸무게 kg"
        />

        <select className="w-full border border-neutral-300 rounded-xl px-4 py-3">
          <option>성별 선택</option>
          <option value="F">여성</option>
          <option value="M">남성</option>
        </select>

        <input
          className="w-full border border-neutral-300 rounded-xl px-4 py-3"
          placeholder="알레르기 예: 우유, 땅콩"
        />

        <Link
          to="/signup/goal"
          className="block w-full py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
        >
          다음
        </Link>
      </div>
    </div>
  );
}