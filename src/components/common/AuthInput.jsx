import { useRef, useState } from "react";

export default function AuthInput({
  icon,
  placeholder,
  value,
  onChange,
  rightElement,
  readOnly = false,
  type = "text",
  className = "",
}) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      role="presentation"
      onClick={() => {
        if (!readOnly) inputRef.current?.focus();
      }}
      className={[
        "h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px]",
        "flex items-center",
        readOnly ? "cursor-default" : "cursor-text",
        className,
      ].join(" ")}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className="w-[16px] h-[16px] object-contain shrink-0 opacity-75"
        />
      )}

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? "" : placeholder}
        readOnly={readOnly}
        className={[
          "ml-[10px] w-full min-w-0 bg-transparent outline-none",
          "text-[12px] font-light text-[#272932]",
          "placeholder:text-[12px] placeholder:font-light placeholder:text-[#a0a0a0]",
          "caret-[#272932]",
          readOnly ? "cursor-default" : "",
        ].join(" ")}
      />

      {rightElement && (
        <div className="ml-[8px] flex h-full shrink-0 items-center justify-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}