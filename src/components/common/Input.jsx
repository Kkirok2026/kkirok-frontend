function MailIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4.75 6.75H19.25V17.25H4.75V6.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M5.25 7.25L12 12.25L18.75 7.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  
  function LockIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect
          x="5.75"
          y="10.25"
          width="12.5"
          height="9"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 10.25V7.75C8.5 5.82 10.07 4.25 12 4.25C13.93 4.25 15.5 5.82 15.5 7.75V10.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  
  function UserIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8.5"
          r="3.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5.75 19.25C6.35 16.25 8.68 14.75 12 14.75C15.32 14.75 17.65 16.25 18.25 19.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  
  function EyeIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4.75 12C6.35 8.95 8.75 7.42 12 7.42C15.25 7.42 17.65 8.95 19.25 12C17.65 15.05 15.25 16.58 12 16.58C8.75 16.58 6.35 15.05 4.75 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="2.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 19L19 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  
  function ChartIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect
          x="4.75"
          y="5.75"
          width="14.5"
          height="14.5"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.25 16V12.75M12 16V9M15.75 16V11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  
  const iconMap = {
    mail: <MailIcon />,
    lock: <LockIcon />,
    user: <UserIcon />,
    eye: <EyeIcon />,
    chart: <ChartIcon />,
  };
  
  function renderIcon(icon) {
    if (!icon) return null;
    if (typeof icon === "string") return iconMap[icon] ?? null;
    return icon;
  }
  
  export default function Input({
    label,
    placeholder,
    type = "text",
    value,
    onChange,
    name,
    required = false,
    error,
    unit,
    icon,
    leftIcon,
    rightIcon,
    rightSlot,
    variant = "filled",
    className = "",
    inputClassName = "",
    readOnly = false,
    disabled = false,
  }) {
    const visibleLeftIcon = renderIcon(leftIcon || icon);
    const visibleRightIcon = renderIcon(rightIcon);
  
    const variantClass = {
      filled: "bg-[#f8f8f8] border border-transparent",
      outline: "bg-white border border-[#b9b5b5]",
    };
  
    return (
      <div className={className}>
        {label && (
          <label className="block text-[13px] font-medium text-[#8a8c90] mb-[8px] tracking-[-0.02em]">
            {label}
            {required && <span className="text-[#ff8b4a] ml-[2px]">*</span>}
          </label>
        )}
  
        <div
          className={[
            "h-[46px] rounded-[13px] px-[15px] flex items-center transition",
            "focus-within:border-[#aaa5a5]",
            variantClass[variant],
            error ? "border-[#ff6b6b]" : "",
            disabled ? "opacity-50" : "",
          ].join(" ")}
        >
          {visibleLeftIcon && (
            <span className="mr-[10px] text-[#272932] shrink-0">
              {visibleLeftIcon}
            </span>
          )}
  
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            className={[
              "w-full min-w-0 bg-transparent outline-none text-[13px] text-[#272932] placeholder:text-[#a7a3a3]",
              inputClassName,
            ].join(" ")}
          />
  
          {unit && (
            <span className="ml-[10px] min-w-[84px] h-[29px] rounded-full bg-[#f1f0eb] text-[#626262] text-[14px] flex items-center justify-center shrink-0">
              {unit}
            </span>
          )}
  
          {rightSlot && <div className="ml-[10px] shrink-0">{rightSlot}</div>}
  
          {visibleRightIcon && !rightSlot && (
            <span className="ml-[10px] text-[#a7a3a3] shrink-0">
              {visibleRightIcon}
            </span>
          )}
        </div>
  
        {error && (
          <p className="mt-[9px] text-center text-[12px] leading-[18px] text-[#ff5f5f] tracking-[-0.02em]">
            {error}
          </p>
        )}
      </div>
    );
  }