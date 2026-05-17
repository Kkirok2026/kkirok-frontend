import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";
import { searchIngredients } from "../api/ingredientApi";
import {
  ALLERGY_CATEGORIES,
  LOCAL_ALLERGY_ITEMS,
} from "../fixtures/allergyOptions";

import SearchIcon from "../assets/icons/Search.svg";

const CATEGORY_DEFAULT_BG = "#f1f0e9";
const CATEGORY_OPEN_BG = "#f8f7f2";
const SELECTED_CHIP_BG = "#cdea70";

function allergyKey(allergy) {
  if (allergy.ingredientId) return `ingredient:${allergy.ingredientId}`;
  return `name:${allergy.ingredientName || allergy.label}`;
}

function normalizeAllergy(allergy) {
  if (typeof allergy === "string") {
    return {
      id: `name:${allergy}`,
      label: allergy,
      ingredientName: allergy,
    };
  }

  const label = allergy.label || allergy.ingredientName || allergy.allergyName;

  return {
    ...allergy,
    id: allergy.id || allergyKey({ ...allergy, label }),
    label,
    ingredientName: allergy.ingredientName || label,
  };
}

function SearchInput({ value, onChange }) {
  return (
    <div className="h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center">
      <img
        src={SearchIcon}
        alt=""
        className="w-[15px] h-[15px] object-contain shrink-0 opacity-60"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="알레르기"
        className="ml-[10px] w-full min-w-0 bg-transparent outline-none font-light text-[#272932] placeholder:font-light placeholder:text-[#a0a0a0] caret-[#272932]"
        style={{
          fontSize: "11px",
          lineHeight: "1",
        }}
      />
    </div>
  );
}

function SelectedChip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="h-[20px] rounded-full px-[13px] flex items-center gap-[6px] font-light tracking-[-0.02em]"
      style={{
        backgroundColor: SELECTED_CHIP_BG,
        color: "#6f7d30",
        fontSize: "10px",
        lineHeight: "1",
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          fontSize: "12px",
          lineHeight: "1",
        }}
      >
        x
      </span>
    </button>
  );
}

function CategoryButton({ label, opened, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[24px] min-w-[76px] rounded-full px-[14px] flex items-center justify-center gap-[6px] font-light tracking-[-0.02em] transition"
      style={{
        backgroundColor: opened ? CATEGORY_OPEN_BG : CATEGORY_DEFAULT_BG,
        color: "#6f7075",
        fontSize: "11px",
        lineHeight: "1",
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          fontSize: "12px",
          lineHeight: "1",
          transform: opened ? "translateY(-1px)" : "translateY(0)",
        }}
      >
        {opened ? "^" : "v"}
      </span>
    </button>
  );
}

function AllergyOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-light tracking-[-0.02em] underline underline-offset-[3px] transition"
      style={{
        color: selected ? "#f29a62" : "#85868b",
        fontSize: "10px",
        lineHeight: "1",
      }}
    >
      {label}
    </button>
  );
}

export default function SignupAllergyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state ?? {};

  const [query, setQuery] = useState("");
  const [openedCategoryId, setOpenedCategoryId] = useState("dairy");
  const [selectedAllergies, setSelectedAllergies] = useState(() =>
    (previousState.allergies ?? []).map(normalizeAllergy)
  );
  const [remoteItems, setRemoteItems] = useState([]);
  const [searchError, setSearchError] = useState("");

  const openedCategory = ALLERGY_CATEGORIES.find(
    (category) => category.id === openedCategoryId
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setRemoteItems([]);
      setSearchError("");
      return;
    }

    let ignore = false;

    async function loadIngredients() {
      try {
        const response = await searchIngredients(trimmedQuery, 20);

        if (ignore) return;

        setRemoteItems(
          (response?.items ?? []).map((item) => ({
            id: `ingredient:${item.ingredientId}`,
            label: item.ingredientName,
            ingredientId: item.ingredientId,
            ingredientName: item.ingredientName,
          }))
        );
        setSearchError("");
      } catch (error) {
        if (ignore) return;
        setRemoteItems([]);
        setSearchError(error.message || "원재료 검색에 실패했습니다.");
      }
    }

    loadIngredients();

    return () => {
      ignore = true;
    };
  }, [query]);

  const filteredItems = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return [];
    if (remoteItems.length > 0) return remoteItems;

    const localMatches = LOCAL_ALLERGY_ITEMS.filter((item) =>
      item.label.includes(trimmedQuery)
    );

    if (localMatches.length > 0) return localMatches;

    return [
      {
        id: `name:${trimmedQuery}`,
        label: trimmedQuery,
        ingredientName: trimmedQuery,
      },
    ];
  }, [query, remoteItems]);

  const toggleAllergy = (allergy) => {
    const normalized = normalizeAllergy(allergy);
    const key = allergyKey(normalized);

    setSelectedAllergies((prev) => {
      if (prev.some((item) => allergyKey(item) === key)) {
        return prev.filter((item) => allergyKey(item) !== key);
      }

      return [...prev, normalized];
    });
  };

  const removeAllergy = (allergy) => {
    const key = allergyKey(allergy);
    setSelectedAllergies((prev) =>
      prev.filter((item) => allergyKey(item) !== key)
    );
  };

  const handlePrev = () => {
    navigate("/signup/profile", {
      state: {
        ...previousState,
        allergies: selectedAllergies,
      },
    });
  };

  const handleNext = () => {
    navigate("/signup/goal", {
      state: {
        ...previousState,
        allergies: selectedAllergies,
      },
    });
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Create account
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-[58px] right-[58px] top-[278px]">
        {selectedAllergies.length > 0 && (
          <div className="mb-[16px] flex flex-wrap items-center gap-x-[8px] gap-y-[7px]">
            {selectedAllergies.map((allergy) => (
              <SelectedChip
                key={allergyKey(allergy)}
                label={allergy.label}
                onRemove={() => removeAllergy(allergy)}
              />
            ))}
          </div>
        )}

        <SearchInput value={query} onChange={setQuery} />

        {query.trim() ? (
          <>
            {searchError && (
              <p className="mt-[10px] text-center text-[11px] font-light text-[#ff5b5b]">
                {searchError}
              </p>
            )}

            <div className="mt-[28px] flex flex-wrap gap-x-[33px] gap-y-[18px] pl-[14px]">
              {filteredItems.map((item) => (
                <AllergyOption
                  key={item.id}
                  label={item.label}
                  selected={selectedAllergies.some(
                    (allergy) => allergyKey(allergy) === allergyKey(item)
                  )}
                  onClick={() => toggleAllergy(item)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-[18px] space-y-[12px]">
            {ALLERGY_CATEGORIES.map((category) => {
              const opened = openedCategoryId === category.id;

              return (
                <div key={category.id}>
                  <CategoryButton
                    label={category.label}
                    opened={opened}
                    onClick={() =>
                      setOpenedCategoryId(opened ? "" : category.id)
                    }
                  />

                  {opened && openedCategory && (
                    <div className="mt-[17px] mb-[18px] flex flex-wrap gap-x-[33px] gap-y-[18px] pl-[14px]">
                      {openedCategory.items.map((itemName) => {
                        const item = {
                          id: `name:${itemName}`,
                          label: itemName,
                          ingredientName: itemName,
                        };

                        return (
                          <AllergyOption
                            key={item.id}
                            label={item.label}
                            selected={selectedAllergies.some(
                              (allergy) =>
                                allergyKey(allergy) === allergyKey(item)
                            )}
                            onClick={() => toggleAllergy(item)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavButtons onPrev={handlePrev} onNext={handleNext} />
    </MobileLayout>
  );
}
