export default function HomePage() {
    return (
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-4">홈</h1>
  
        <div className="rounded-2xl bg-green-50 p-4 mb-4">
          <p className="text-sm text-green-800">
            어제 너무 단 것을 먹었어요. 오늘은 탄수화물을 조금 줄여보세요.
          </p>
        </div>
  
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border p-4">
            <p className="text-sm text-neutral-500">열량</p>
            <p className="text-xl font-bold">760 kcal</p>
          </div>
  
          <div className="rounded-2xl bg-white border p-4">
            <p className="text-sm text-neutral-500">단백질</p>
            <p className="text-xl font-bold">42 g</p>
          </div>
  
          <div className="rounded-2xl bg-white border p-4">
            <p className="text-sm text-neutral-500">탄수화물</p>
            <p className="text-xl font-bold">110 g</p>
          </div>
  
          <div className="rounded-2xl bg-white border p-4">
            <p className="text-sm text-neutral-500">지방</p>
            <p className="text-xl font-bold">23 g</p>
          </div>
        </div>
      </div>
    );
  }