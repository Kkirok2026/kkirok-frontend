export default function Button({
    children,
    type = "button",
    variant = "black",
    size = "md",
    full = true,
    disabled = false,
    onClick,
    className = "",
  }) {
    const baseClass =
      "inline-flex items-center justify-center font-bold tracking-[-0.02em] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";
  
    const sizeClass = {
      sm: "h-[40px] rounded-[10px] px-[18px] text-[12px]",
      md: "h-[58px] rounded-[10px] px-[24px] text-[15px]",
      lg: "h-[64px] rounded-[10px] px-[28px] text-[16px]",
      circle: "w-[56px] h-[56px] rounded-full text-[24px]",
    };
  
    const variantClass = {
      black:
        "bg-black text-white shadow-[0_18px_24px_rgba(0,0,0,0.20)]",
      dark:
        "bg-[#272932] text-white shadow-[0_14px_20px_rgba(39,41,50,0.18)]",
      white:
        "bg-white text-[#272932] border border-[#f0f0f0] shadow-[0_16px_22px_rgba(0,0,0,0.14)]",
      gray:
        "bg-[#f7f7f7] text-[#8a8c90]",
      outline:
        "bg-white text-[#272932] border border-[#d7d2d2]",
      ghost:
        "bg-transparent text-[#8a8c90]",
    };
  
    const widthClass = full && size !== "circle" ? "w-full" : "";
  
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={[
          baseClass,
          sizeClass[size],
          variantClass[variant],
          widthClass,
          className,
        ].join(" ")}
      >
        {children}
      </button>
    );
  }