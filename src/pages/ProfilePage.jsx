export default function ProfilePage() {
    return (
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-4">프로필</h1>
  
        <div className="space-y-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">키</p>
            <p className="text-lg font-bold">165 cm</p>
          </div>
  
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">몸무게</p>
            <p className="text-lg font-bold">55 kg</p>
          </div>
  
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">BMI</p>
            <p className="text-lg font-bold">20.2</p>
          </div>
  
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">알레르기</p>
            <p className="text-lg font-bold">우유, 땅콩</p>
          </div>
        </div>
      </div>
    );
  }