import { Link } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Input from "../components/common/Input";

export default function FoodSearchPage() {
  const foods = ["Tovuqli steyk", "Sut", "Salad", "Yorma"];

  return (
    <div className="min-h-screen px-7">
      <PageHeader eyebrow="Recommend Meal" title="77ㅣ록" />

      <div className="mb-8">
        <Input placeholder="고기" />
      </div>

      <h2 className="text-base font-bold mb-8">
        검색된 “고기” 관련 식단
      </h2>

      <div className="space-y-10">
        {foods.map((food, index) => (
          <Link
            key={food}
            to={`/foods/${index + 1}`}
            className="flex items-center justify-between"
          >
            <span className="text-sm">{food}</span>

            <span className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}