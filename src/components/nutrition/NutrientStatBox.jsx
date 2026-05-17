import { getNutrientMeta } from "./nutrientData";

export default function NutrientStatBox({ type, value, unit = "g" }) {
  const meta = getNutrientMeta(type);

  return (
    <div className="h-[56px] rounded-[13px] border border-[#d7d2d2] px-[14px] flex items-center justify-between">
      <span className="text-[12px] font-bold text-[#272932] tracking-[-0.02em]">
        {meta.label}
      </span>

      <span className="text-[12px] font-bold text-[#69a80f] tracking-[-0.02em]">
        {value} {unit}
      </span>
    </div>
  );
}