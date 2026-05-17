import PageHeader from "../components/layout/PageHeader";

export default function ProfilePage() {
  return (
    <div className="min-h-screen px-8">
      <PageHeader title="Profile" />

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center">
          👤
        </div>

        <p className="font-bold">김하은</p>

        <button
          type="button"
          className="ml-auto px-8 h-9 rounded-full bg-neutral-800 text-white text-xs font-bold"
        >
          수정
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Bo'y", value: "180cm" },
          { label: "Og'irlik", value: "65kg" },
          { label: "BMI", value: "22" },
        ].map((item) => (
          <div
            key={item.label}
            className="h-16 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center shadow-sm"
          >
            <p className="text-sm font-bold">{item.value}</p>
            <p className="text-[10px] text-neutral-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <ProfileBox title="목표 몸무게" value="30 Kg" />
        <ProfileBox title="목표 기간" value="1 year" />
        <ProfileBox title="알러지" value="계란" />
      </div>
    </div>
  );
}

function ProfileBox({ title, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 shadow-sm">
      <p className="font-bold mb-3">{title}</p>
      <p className="text-neutral-500">{value}</p>
    </div>
  );
}