import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import { searchFoods } from "../api/foodApi";

import SearchIcon from "../assets/icons/Search.svg";
import DuckResultImage from "../assets/images/duck_result.png";
import DuckCryingImage from "../assets/images/duck_crying.png";

function hasMealTarget(searchParams) {
  return (
    searchParams.get("source") === "meal-add" &&
    Boolean(searchParams.get("mealType"))
  );
}

function appendMealTargetParams(nextParams, searchParams) {
  if (!hasMealTarget(searchParams)) return;

  nextParams.set("source", "meal-add");

  for (const key of ["mealType", "date", "mealLogId"]) {
    const value = searchParams.get(key);
    if (value) nextParams.set(key, value);
  }
}

function buildFoodDetailPath(foodId, searchParams) {
  const nextParams = new URLSearchParams();

  appendMealTargetParams(nextParams, searchParams);

  const queryString = nextParams.toString();
  return queryString ? `/foods/${foodId}?${queryString}` : `/foods/${foodId}`;
}

function buildCreateMealPath(query, searchParams) {
  const nextParams = new URLSearchParams();

  if (query.trim()) nextParams.set("q", query.trim());

  appendMealTargetParams(nextParams, searchParams);

  const queryString = nextParams.toString();
  return queryString ? `/create-meal?${queryString}` : "/create-meal";
}

function SearchBox({
  value,
  onValueChange,
  onComposingChange,
  autoFocus = false,
}) {
  const handleChange = (event) => {
    onValueChange(event.target.value);
  };

  const handleCompositionStart = () => {
    onComposingChange?.(true);
  };

  const handleCompositionEnd = (event) => {
    const inputElement = event.currentTarget;

    requestAnimationFrame(() => {
      onValueChange(inputElement.value);
      onComposingChange?.(false);
    });
  };

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
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder=""
        className="ml-[9px] w-full min-w-0 bg-transparent outline-none font-light text-[#272932] caret-[#272932]"
        style={{
          fontSize: "12px",
          lineHeight: "12px",
        }}
      />
    </div>
  );
}

function EmptySearchView({ inputValue, onValueChange, onComposingChange }) {
  return (
    <main className="absolute left-[52px] right-[52px] top-[274px] flex flex-col items-center text-center">
      <img
        src={DuckResultImage}
        alt="음식 검색 안내"
        className="w-[260px] h-auto object-contain"
      />

      <p className="mt-[38px] text-[13px] font-bold leading-[20px] text-[#272932] tracking-[-0.03em]">
        원하는 음식을 검색하면 영양 정보를 볼 수 있어요
      </p>

      <div className="mt-[30px] w-full">
        <SearchBox
          value={inputValue}
          onValueChange={onValueChange}
          onComposingChange={onComposingChange}
        />
      </div>
    </main>
  );
}

function SearchHeader({
  inputValue,
  onValueChange,
  onComposingChange,
  onBack,
}) {
  return (
    <div className="mt-[12px] flex items-center gap-[14px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="h-[28px] w-[28px] rounded-[7px] bg-transparent text-[20px] leading-none text-[#272932] flex items-center justify-center shrink-0"
      >
        ‹
      </button>

      <div className="w-[270px] shrink-0">
        <SearchBox
          value={inputValue}
          onValueChange={onValueChange}
          onComposingChange={onComposingChange}
          autoFocus
        />
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
        className="mt-[100px] w-[360px] h-auto object-contain"
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

  const initialQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [hasResultMode, setHasResultMode] = useState(
    initialQuery.trim().length > 0
  );
  const [isComposing, setIsComposing] = useState(false);
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isComposing) return undefined;

    const timer = window.setTimeout(() => {
      setQuery(inputValue);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inputValue, isComposing]);

  const trimmedQuery = query.trim();
  const hasSearched = trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) {
      setFoods([]);
      setError("");
      setIsLoading(false);
      return undefined;
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
    }, 100);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (hasSearched) {
      setHasResultMode(true);
    }
  }, [hasSearched]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    setInputValue("");
    setQuery("");
  };

  const content = useMemo(() => {
    if (!hasResultMode) {
      return (
        <EmptySearchView
          inputValue={inputValue}
          onValueChange={setInputValue}
          onComposingChange={setIsComposing}
        />
      );
    }

    return (
      <div className="absolute inset-0 overflow-y-auto bg-white px-[58px] pb-[126px]">
        <PageHeader eyebrow="Recommend Meal" title="77ㅣ록" compact />

        <SearchHeader
          inputValue={inputValue}
          onValueChange={setInputValue}
          onComposingChange={setIsComposing}
          onBack={handleBack}
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

        {!hasSearched && (
          <p className="mt-[30px] text-[13px] font-light text-[#8a8c90]">
            검색어를 입력해 주세요.
          </p>
        )}

        {hasSearched && !isLoading && !error && foods.length > 0 && (
          <ResultList
            query={query}
            foods={foods}
            searchParams={searchParams}
          />
        )}

        {hasSearched && !isLoading && !error && foods.length === 0 && (
          <NoResultView query={query} searchParams={searchParams} />
        )}
      </div>
    );
  }, [
    error,
    foods,
    hasResultMode,
    hasSearched,
    inputValue,
    isLoading,
    query,
    searchParams,
  ]);

  return (
    <MobileLayout>
      {!hasResultMode && (
        <PageHeader
          eyebrow="Recommend Meal"
          title="77ㅣ록"
          className="absolute left-0 right-0 top-0"
        />
      )}

      {content}

    </MobileLayout>
  );
}
