import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import { searchFoods } from "../api/foodApi";

import SearchIcon from "../assets/icons/Search.svg";
import DuckResultImage from "../assets/images/duck_result.png";
import DuckCryingImage from "../assets/images/duck_crying.png";

function buildFoodDetailPath(foodId, searchParams) {
  const nextParams = new URLSearchParams();

  for (const key of ["mealType", "date", "mealLogId"]) {
    const value = searchParams.get(key);
    if (value) nextParams.set(key, value);
  }

  const queryString = nextParams.toString();
  return queryString ? `/foods/${foodId}?${queryString}` : `/foods/${foodId}`;
}

function buildCreateMealPath(query, searchParams) {
  const nextParams = new URLSearchParams();

  if (query.trim()) nextParams.set("q", query.trim());

  for (const key of ["mealType", "date", "mealLogId"]) {
    const value = searchParams.get(key);
    if (value) nextParams.set(key, value);
  }

  const queryString = nextParams.toString();
  return queryString ? `/create-meal?${queryString}` : "/create-meal";
}

function SearchBox({ value, onChange, autoFocus = false }) {
  return (
    <div className="h-[30px] rounded-[9px] bg-[#f8f8f8] px-[12px] flex items-center">
      <img
        src={SearchIcon}
        alt=""
        className="w-[11px] h-[11px] object-contain shrink-0 opacity-70"
      />

      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=""
        className="ml-[9px] w-full min-w-0 bg-transparent outline-none font-light text-[#272932] caret-[#272932]"
        style={{
          fontSize: "12px",
          lineHeight: "14px",
        }}
      />
    </div>
  );
}

function EmptySearchView({ query, onChange }) {
  return (
    <main className="absolute left-[52px] right-[52px] top-[250px] flex flex-col items-center text-center">
      <img
        src={DuckResultImage}
        alt="음식 검색 안내"
        className="w-[290px] h-auto object-contain"
      />

      <p className="mt-[38px] text-[13px] font-bold leading-[20px] text-[#272932] tracking-[-0.03em]">
        원하는 음식을 검색하면 영양 정보를 볼 수 있어요
      </p>

      <div className="mt-[30px] w-full">
        <SearchBox value={query} onChange={onChange} />
      </div>
    </main>
  );
}

function SearchHeader({ query, onChange, onBack }) {
  return (
    <div className="mt-[12px] flex items-center gap-[14px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="h-[28px] w-[28px] rounded-[7px] bg-[#f8f8f8] text-[20px] leading-none text-[#272932] flex items-center justify-center shrink-0"
      >
        ‹
      </button>

      <div className="w-[250px] shrink-0">
        <SearchBox value={query} onChange={onChange} autoFocus />
      </div>
    </div>
  );
}

function NoResultView({ query, searchParams }) {
  return (
    <div className="mt-[28px] flex flex-col items-center text-center">
      <h2 className="self-stretch text-left text-[15px] leading-[22px] font-bold text-[#272932] tracking-[-0.03em]">
        검색된 “{query.trim()}” 관련된 식단이 없습니다
      </h2>

      <img
        src={DuckCryingImage}
        alt="검색 결과 없음"
        className="mt-[108px] w-[330px] h-auto object-contain"
      />

      <Link
        to={buildCreateMealPath(query, searchParams)}
        state={{ query: query.trim() }}
        className="mt-[52px] h-[52px] w-full rounded-[10px] bg-[#e6e6e6] flex items-center justify-center text-[13px] font-bold text-[#4e5058] shadow-[0_12px_20px_rgba(0,0,0,0.14)]"
      >
        직접 식단에 추가하기
      </Link>
    </div>
  );
}

function ResultList({ query, foods, searchParams }) {
  return (
    <>
      <h2 className="mt-[30px] text-[15px] leading-[22px] font-bold text-[#272932] tracking-[-0.03em]">
        검색된 “{query.trim()}” 관련 식단
      </h2>

      <div className="mt-[30px] space-y-[32px]">
        {foods.map((food) => (
          <Link
            key={food.foodId}
            to={buildFoodDetailPath(food.foodId, searchParams)}
            state={{ food }}
            className="flex h-[28px] items-center justify-between"
          >
            <span className="text-[13px] font-medium text-[#272932] tracking-[-0.02em] truncate pr-[16px]">
              {food.foodName}
            </span>

            <span className="w-[26px] h-[26px] rounded-full border border-[#cfcfcf] flex items-center justify-center text-[#a0a0a0] text-[20px] leading-none shrink-0">
              ›
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function FoodSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const trimmedQuery = query.trim();
  const hasSearched = trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) {
      setFoods([]);
      setError("");
      setIsLoading(false);
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
  }, [trimmedQuery]);

  const content = useMemo(() => {
    if (!hasSearched) {
      return <EmptySearchView query={query} onChange={setQuery} />;
    }

    return (
      <div className="absolute inset-0 overflow-y-auto bg-white px-[58px] pb-[126px]">
        <PageHeader eyebrow="Recommend Meal" title="77ㅣ록" compact />

        <SearchHeader
          query={query}
          onChange={setQuery}
          onBack={() => {
            if (window.history.length > 1) navigate(-1);
            else setQuery("");
          }}
        />

        {isLoading && (
          <p className="mt-[24px] text-[12px] font-light text-[#8a8c90]">
            검색 중입니다.
          </p>
        )}

        {error && (
          <p className="mt-[24px] text-[12px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}

        {!isLoading && !error && foods.length > 0 && (
          <ResultList
            query={query}
            foods={foods}
            searchParams={searchParams}
          />
        )}

        {!isLoading && !error && foods.length === 0 && (
          <NoResultView query={query} searchParams={searchParams} />
        )}
      </div>
    );
  }, [error, foods, hasSearched, isLoading, navigate, query, searchParams]);

  return (
    <MobileLayout>
      {!hasSearched && (
        <PageHeader
          eyebrow="Recommend Meal"
          title="77ㅣ록"
          className="absolute left-0 right-0 top-0"
        />
      )}

      {content}

      <BottomNav />
    </MobileLayout>
  );
}