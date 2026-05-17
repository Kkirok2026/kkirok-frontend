export const ALLERGY_CATEGORIES = [
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

export const LOCAL_ALLERGY_ITEMS = ALLERGY_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({
    id: `name:${item}`,
    label: item,
    ingredientName: item,
    categoryId: category.id,
  }))
);
