import Button from "./Button";

export default function Modal({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onCancel,
  children,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/25 flex items-center justify-center px-[38px]">
      <div className="w-full max-w-[282px] rounded-[8px] bg-white px-[26px] pt-[26px] pb-[18px] shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
        <div className="relative min-h-[26px] mb-[22px]">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="닫기"
              className="absolute left-0 top-0 text-[22px] leading-none text-[#272932]"
            >
              ×
            </button>
          )}

          <h2 className="text-center text-[15px] font-bold leading-[24px] text-[#272932] tracking-[-0.02em] px-[20px]">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mb-[26px] text-center text-[13px] leading-[22px] text-[#272932] tracking-[-0.02em] whitespace-pre-line">
            {description}
          </p>
        )}

        {children && <div className="mb-[20px]">{children}</div>}

        <div className={cancelText ? "grid grid-cols-2 gap-[10px]" : ""}>
          {cancelText && (
            <Button variant="white" size="sm" onClick={onCancel}>
              {cancelText}
            </Button>
          )}

          <Button variant="dark" size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}