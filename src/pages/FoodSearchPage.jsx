import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import Input from "../components/common/Input";
import { searchFoods } from "../api/foodApi";

function buildFoodDetailPath(foodId, searchParams) {
  const nextParams = new URLSearchParams();

  for (const key of ["mealType", "date", "mealLogId"]) {
    const value = searchParams.get(key);
    if (value) nextParams.set(key, value);
  }

  const queryString = nextParams.toString();
  return queryString ? `/foods/${foodId}?${queryString}` : `/foods/${foodId}`;
}

export default function FoodSearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setFoods([]);
      setError("");
      return;
    }

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await searchFoods(trimmedQuery, 20);
        if (!ignore) setFoods(response?.items ?? []);
      } catch (searchError) {
        if (!ignore) {
          setFoods([]);
          setError(searchError.message || "음식 검색에 실패했습니다.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto px-7 pb-[126px]">
        <PageHeader eyebrow="Recommend Meal" title="77ㅣ록" />

        <div className="mb-8">
          <Input
            placeholder="음식명을 검색하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <h2 className="text-base font-bold mb-8">
          {query.trim() ? `검색된 "${query.trim()}" 관련 식단` : "음식 검색"}
        </h2>

        {isLoading && (
          <p className="text-xs text-neutral-400">검색 중입니다.</p>
        )}

        {error && <p className="text-xs text-[#ff5b5b]">{error}</p>}

        {!isLoading && query.trim() && foods.length === 0 && !error && (
          <p className="text-xs text-neutral-400">검색 결과가 없습니다.</p>
        )}

        <div className="space-y-10">
          {foods.map((food) => (
            <Link
              key={food.foodId}
              to={buildFoodDetailPath(food.foodId, searchParams)}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{food.foodName}</span>

              <span className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400">
                ›
              </span>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}
