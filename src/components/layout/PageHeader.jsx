import { useNavigate } from "react-router-dom";
import KkirokLogo from "../common/KkirokLogo";

export default function PageHeader({
  eyebrow,
  title = "77ㅣ록",
  showBack = false,
  onBack,
  className = "",
  compact = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header
      className={[
        "relative flex flex-col items-center",
        compact ? "pt-[56px] pb-[38px]" : "pt-[86px] pb-[54px]",
        className,
      ].join(" ")}
    >
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="absolute left-[46px] top-[68px] w-[28px] h-[28px] rounded-[7px] bg-[#f8f8f8] text-[#272932] flex items-center justify-center text-[20px] leading-none"
        >
          ‹
        </button>
      )}

      {eyebrow && (
        <p className="text-[15px] leading-none text-[#272932] tracking-[-0.02em] mb-[5px]">
          {eyebrow}
        </p>
      )}

      {title === "77ㅣ록" ? (
        <KkirokLogo />
      ) : (
        <h1 className="text-[24px] leading-none font-extrabold tracking-[-0.06em] text-[#272932]">
          {title}
        </h1>
      )}
    </header>
  );
}