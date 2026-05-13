export default function FoodDetailPage() {
    return (
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-2">닭가슴살 샐러드</h1>
        <p className="text-sm text-neutral-500 mb-6">1회 제공량 기준</p>
  
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">열량</p>
            <p className="text-xl font-bold">320 kcal</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">단백질</p>
            <p className="text-xl font-bold">28 g</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">탄수화물</p>
            <p className="text-xl font-bold">18 g</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">지방</p>
            <p className="text-xl font-bold">8 g</p>
          </div>
        </div>
  
        <button className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold">
          식단에 추가
        </button>
      </div>
    );
  }