export default function BottomNavButtons({
  onPrev,
  onNext,
  prevText = "이전",
  nextText = "다음",
  bottomClassName = "bottom-[106px]",
  nextDisabled = false,
}) {
  return (
    <div
      className={[
        "absolute left-[58px] right-[58px] flex gap-[10px]",
        bottomClassName,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onPrev}
        style={{ fontWeight: 700 }}
        className="h-[50px] flex-1 rounded-[10px] bg-white text-[#272932] text-[13px] leading-[16px] font-bold tracking-[-0.02em] shadow-[0_16px_22px_rgba(0,0,0,0.14)] active:scale-[0.98] transition"
      >
        {prevText}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          fontWeight: 700,
        }}
        className={[
          "h-[50px] flex-1 rounded-[10px] text-[13px] leading-[16px] font-bold tracking-[-0.02em]",
          "shadow-[0_16px_22px_rgba(0,0,0,0.22)] active:scale-[0.98] transition",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        ].join(" ")}
      >
        {nextText}
      </button>
    </div>
  );
}
