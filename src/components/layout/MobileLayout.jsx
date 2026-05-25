import BottomNav from "./BottomNav";

export default function MobileLayout({ children, className = "" }) {
  return (
    <div className="w-full h-dvh bg-white flex justify-center overflow-hidden">
      <div
        className={[
          "relative w-full max-w-[430px] h-dvh bg-white overflow-hidden",
          className,
        ].join(" ")}
      >
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
