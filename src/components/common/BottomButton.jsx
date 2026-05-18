export default function BottomButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  bottomClassName = "bottom-[72px]",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
      }}
      className={[
        "absolute left-[58px] right-[58px]",
        bottomClassName,
        "h-[60px] rounded-[10px]",
        "flex items-center justify-center",
        "text-[15px] font-bold tracking-[-0.02em]",
        "shadow-[0_18px_24px_rgba(0,0,0,0.22)]",
        "active:scale-[0.98] transition",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        className,
      ].join(" ")}
    >
      <span className="text-white">{children}</span>
    </button>
  );
}