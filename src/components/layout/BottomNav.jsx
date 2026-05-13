import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { to: "/home", label: "홈" },
    { to: "/search", label: "검색" },
    { to: "/university-meal", label: "학식" },
    { to: "/profile", label: "프로필" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `text-sm font-medium ${
              isActive ? "text-green-700" : "text-neutral-400"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}