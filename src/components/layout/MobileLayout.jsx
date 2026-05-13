import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function MobileLayout({ children }) {
  const location = useLocation();

  const hideBottomNavPaths = ["/", "/login", "/signup", "/signup/profile", "/signup/goal"];

  const shouldShowBottomNav = !hideBottomNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <main className="relative w-full max-w-[430px] min-h-screen bg-white overflow-hidden">
        <div className={shouldShowBottomNav ? "pb-20" : ""}>{children}</div>

        {shouldShowBottomNav && <BottomNav />}
      </main>
    </div>
  );
}