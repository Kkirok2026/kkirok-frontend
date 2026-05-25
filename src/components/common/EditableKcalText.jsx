import { useState } from "react";

import { toRounded } from "../../utils/mealData";

function cleanDecimal(value) {
  const onlyNumber = `${value ?? ""}`.replace(/[^\d.]/g, "");
  const [head, ...tail] = onlyNumber.split(".");

  if (tail.length === 0) return head;
  return `${head}.${tail.join("")}`;
}

export default function EditableKcalText({
  value,
  onSave,
  className = "",
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = (event) => {
    event?.stopPropagation();
    if (disabled) return;
    const number = Number(value);
    setDraft(Number.isFinite(number) ? `${toRounded(number)}` : "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft("");
  };

  const commitEdit = async () => {
    if (!isEditing) return;
    const number = Number(draft);
    if (!Number.isFinite(number) || number < 0) {
      cancelEdit();
      return;
    }
    await onSave?.(number);
    cancelEdit();
  };

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-[3px]" onClick={(event) => event.stopPropagation()}>
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(cleanDecimal(event.target.value))}
          onBlur={commitEdit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              cancelEdit();
            }
          }}
          autoFocus
          className={[
            "w-[54px] bg-transparent text-right outline-none",
            className,
          ].join(" ")}
        />
        <span className={className}>kcal</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={disabled}
      className={["inline-flex items-center", className, disabled ? "cursor-default" : ""].join(" ")}
    >
      {toRounded(value)} kcal
    </button>
  );
}
