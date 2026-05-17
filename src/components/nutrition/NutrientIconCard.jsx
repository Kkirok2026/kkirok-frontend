import { getNutrientMeta } from "./nutrientData";

export default function NutrientIconCard({
  type,
  label,
  value,
  className = "",
  iconClassName = "",
}) {
  const meta = getNutrientMeta(type);
  const displayLabel = label ?? meta.label;

  return (
    <div className={className}>
      <div className="h-[68px] rounded-[9px] bg-[#f8f8f8] flex items-center justify-center mb-[8px]">
        <img
          src={meta.icon}
          alt={displayLabel}
          className={["max-w-[48px] max-h-[48px] object-contain", iconClassName].join(" ")}
        />
      </div>

      <p className="text-[11px] leading-[16px] font-bold text-[#272932] tracking-[-0.02em]">
        {displayLabel}
      </p>

      {value && (
        <p className="mt-[2px] text-[10px] leading-[15px] text-[#8a8c90] tracking-[-0.02em]">
          {value}
        </p>
      )}
    </div>
  );
}