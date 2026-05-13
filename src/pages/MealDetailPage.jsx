export default function MealDetailPage() {
    return (
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-4">식단 상세</h1>
  
        <div className="rounded-2xl border p-4 mb-4">
          <p className="font-semibold">점심 식단</p>
          <p className="text-sm text-neutral-500">총 760 kcal</p>
        </div>
  
        <div className="space-y-3">
          <div className="rounded-2xl border p-4">
            <p className="font-semibold">닭가슴살 샐러드</p>
            <p className="text-sm text-neutral-500">320 kcal</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="font-semibold">잡곡밥</p>
            <p className="text-sm text-neutral-500">280 kcal</p>
          </div>
        </div>
      </div>
    );
  }