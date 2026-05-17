export default function BottomNavButtons({
    onPrev,
    onNext,
    prevText = "이전",
    nextText = "다음",
    bottomClassName = "bottom-[72px]",
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
          className="h-[60px] flex-1 rounded-[10px] bg-white text-[#272932] text-[15px] font-bold tracking-[-0.02em] shadow-[0_18px_24px_rgba(0,0,0,0.16)] active:scale-[0.98] transition"
        >
          {prevText}
        </button>
  
        <button
          type="button"
          onClick={onNext}
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
          }}
          className="h-[60px] flex-1 rounded-[10px] text-[15px] font-bold tracking-[-0.02em] shadow-[0_18px_24px_rgba(0,0,0,0.22)] active:scale-[0.98] transition"
        >
          <span className="text-white">{nextText}</span>
        </button>
      </div>
    );
  }
