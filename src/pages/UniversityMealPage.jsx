export default function UniversityMealPage() {
    return (
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-4">학식 / 긱식</h1>
  
        <div className="flex gap-2 mb-5">
          <button className="flex-1 py-2 rounded-xl bg-green-600 text-white">
            점심
          </button>
          <button className="flex-1 py-2 rounded-xl bg-neutral-100">
            저녁
          </button>
        </div>
  
        <div className="space-y-3">
          <div className="rounded-2xl border p-4 bg-white">
            <p className="text-xs text-green-700 font-semibold mb-1">추천</p>
            <p className="font-bold">학생식당 한식</p>
            <p className="text-sm text-neutral-500 mt-1">
              잡곡밥 / 닭가슴살 샐러드 / 김치
            </p>
            <p className="text-sm mt-3">단백질이 높아 오늘 식단에 적합해요.</p>
          </div>
  
          <div className="rounded-2xl border p-4 bg-white">
            <p className="font-bold">생활관식당</p>
            <p className="text-sm text-neutral-500 mt-1">
              흰밥 / 김치찌개 / 계란말이
            </p>
            <p className="text-sm mt-3 text-orange-600">
              나트륨이 높을 수 있어요.
            </p>
          </div>
        </div>
      </div>
    );
  }