import { Link } from "react-router-dom";

export default function FoodSearchPage() {
  return (
    <div className="px-5 py-6">
      <h1 className="text-2xl font-bold mb-4">음식 검색</h1>

      <input
        className="w-full border border-neutral-300 rounded-xl px-4 py-3 mb-5"
        placeholder="음식명을 검색하세요"
      />

      <div className="space-y-3">
        <Link
          to="/foods/1"
          className="block rounded-2xl border p-4 bg-white"
        >
          <p className="font-semibold">닭가슴살 샐러드</p>
          <p className="text-sm text-neutral-500">320 kcal · 단백질 28g</p>
        </Link>

        <Link
          to="/foods/2"
          className="block rounded-2xl border p-4 bg-white"
        >
          <p className="font-semibold">갈비찜</p>
          <p className="text-sm text-neutral-500">620 kcal · 나트륨 높음</p>
        </Link>
      </div>
    </div>
  );
}