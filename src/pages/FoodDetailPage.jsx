import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";

export default function FoodDetailPage() {
  const nutrients = [
    { name: "탄수화물", value: "100gr", icon: "🥩" },
    { name: "당", value: "30sh qoshiq", icon: "🥣" },
    { name: "나트륨", value: "20sh qoshiq", icon: "🥤" },
    { name: "단백질", value: "2ta element", icon: "🥚" },
    { name: "지방", value: "100gr", icon: "🥗" },
    { name: "콜레스테롤", value: "30sh qoshiq", icon: "🥣" },
  ];

  return (
    <div className="min-h-screen px-7">
      <PageHeader eyebrow="Meal details" title="77ㅣ록" showBack />

      <h2 className="text-xl font-extrabold mb-8">
        감자샐러드
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {nutrients.map((item) => (
          <div key={item.name}>
            <div className="h-16 rounded-xl bg-neutral-50 flex items-center justify-center text-2xl mb-2">
              {item.icon}
            </div>

            <p className="text-xs font-bold">{item.name}</p>
            <p className="text-[10px] text-neutral-400">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="absolute left-8 right-8 bottom-28">
        <Button>식단에 추가</Button>
      </div>
    </div>
  );
}