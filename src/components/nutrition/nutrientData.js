import CarbsIcon from "../../assets/icons/Carbs.png";
import ProteinIcon from "../../assets/icons/Protein.png";
import FatIcon from "../../assets/icons/Fat.png";
import SugarIcon from "../../assets/icons/Sugar.png";
import SodiumIcon from "../../assets/icons/Sodium.png";

export const nutrientMeta = {
  carbs: {
    label: "탄수화물",
    icon: CarbsIcon,
  },
  protein: {
    label: "단백질",
    icon: ProteinIcon,
  },
  fat: {
    label: "지방",
    icon: FatIcon,
  },
  sugar: {
    label: "당",
    icon: SugarIcon,
  },
  sodium: {
    label: "나트륨",
    icon: SodiumIcon,
  },
  cholesterol: {
    label: "콜레스테롤",
    icon: SugarIcon,
  },
};

export function getNutrientMeta(type) {
  return nutrientMeta[type] ?? nutrientMeta.carbs;
}