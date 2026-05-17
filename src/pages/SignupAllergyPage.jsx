import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";

import SearchIcon from "../assets/icons/Search.svg";

const ALLERGY_CATEGORIES = [
  {
    id: "dairy",
    label: "유제품류",
    items: ["계란", "우유", "치즈", "요거트", "버터"],
  },
  {
    id: "nuts",
    label: "견과류",
    items: ["땅콩", "아몬드", "호두", "캐슈넛", "피스타치오"],
  },
  {
    id: "fruit",
    label: "과일",
    items: ["복숭아", "키위", "바나나", "사과", "딸기"],
  },
  {
    id: "seafood",
    label: "갑각류",
    items: ["새우", "게", "갑오징어", "오징어"],
  },
  {
    id: "meat",
    label: "육류",
    items: ["소고기", "돼지고기", "닭고기", "양고기"],
  },
];

const ALLERGY_ITEMS = ALLERGY_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({
    id: `${category.id}-${item}`,
    label: item,
    categoryId: category.id,
  }))
);

const CATEGORY_DEFAULT_BG = "#f1f0e9";
const CATEGORY_OPEN_BG = "#f8f7f2";
const SELECTED_CHIP_BG = "#cdea70";

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
        ×
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
        {opened ? "⌃" : "⌄"}
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
  const [selectedAllergies, setSelectedAllergies] = useState(
    previousState.allergies ?? []
  );

  const openedCategory = ALLERGY_CATEGORIES.find(
    (category) => category.id === openedCategoryId
  );

  const filteredItems = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return [];

    return ALLERGY_ITEMS.filter((item) => item.label.includes(trimmedQuery));
  }, [query]);

  const toggleAllergy = (label) => {
    setSelectedAllergies((prev) => {
      if (prev.includes(label)) {
        return prev.filter((item) => item !== label);
      }

      return [...prev, label];
    });
  };

  const removeAllergy = (label) => {
    setSelectedAllergies((prev) => prev.filter((item) => item !== label));
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
                key={allergy}
                label={allergy}
                onRemove={() => removeAllergy(allergy)}
              />
            ))}
          </div>
        )}

        <SearchInput value={query} onChange={setQuery} />

        {query.trim() ? (
          <div className="mt-[28px] flex flex-wrap gap-x-[33px] gap-y-[18px] pl-[14px]">
            {filteredItems.map((item) => (
              <AllergyOption
                key={item.id}
                label={item.label}
                selected={selectedAllergies.includes(item.label)}
                onClick={() => toggleAllergy(item.label)}
              />
            ))}
          </div>
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
                      {openedCategory.items.map((item) => (
                        <AllergyOption
                          key={item}
                          label={item}
                          selected={selectedAllergies.includes(item)}
                          onClick={() => toggleAllergy(item)}
                        />
                      ))}
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