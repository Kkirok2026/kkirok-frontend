import { NavLink } from "react-router-dom";

import HomeActiveIcon from "../../assets/icons/Home-ac.svg";
import HomeInactiveIcon from "../../assets/icons/Home-inac.svg";
import SearchActiveIcon from "../../assets/icons/Search-ac.svg";
import SearchInactiveIcon from "../../assets/icons/Search-inac.svg";
import MealActiveIcon from "../../assets/icons/Meal-ac.svg";
import MealInactiveIcon from "../../assets/icons/Meal-inac.svg";
import ProfileActiveIcon from "../../assets/icons/Profile-ac.svg";
import ProfileInactiveIcon from "../../assets/icons/Profile-inac.svg";
import DuckNavImage from "../../assets/images/duck_navi.png";

const navItems = [
  {
    to: "/home",
    label: "홈",
    activeIcon: HomeActiveIcon,
    inactiveIcon: HomeInactiveIcon,
    className: "w-[28px] h-[28px]",
  },
  {
    to: "/search",
    label: "검색",
    activeIcon: SearchActiveIcon,
    inactiveIcon: SearchInactiveIcon,
    className: "w-[28px] h-[36px]",
  },
  {
    to: "/university-meal",
    label: "식단",
    activeIcon: MealActiveIcon,
    inactiveIcon: MealInactiveIcon,
    className: "w-[24px] h-[24px]",
  },
  {
    to: "/profile",
    label: "프로필",
    activeIcon: ProfileActiveIcon,
    inactiveIcon: ProfileInactiveIcon,
    className: "w-[28px] h-[34px]",
  },
];

function NavIcon({ item }) {
  return (
    <NavLink
      to={item.to}
      aria-label={item.label}
      className="h-full flex items-center justify-center"
    >
      {({ isActive }) => (
        <img
          src={isActive ? item.activeIcon : item.inactiveIcon}
          alt=""
          className={item.className}
        />
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="absolute left-0 right-0 bottom-0 h-[86px] bg-white border-t border-[#f5f5f5] grid grid-cols-5 items-center px-[22px] z-40">
      <NavIcon item={navItems[0]} />
      <NavIcon item={navItems[1]} />

      <div className="relative h-full flex items-end justify-center overflow-visible">
        <img
          src={DuckNavImage}
          alt=""
          className="absolute bottom-[-5px] w-[58px] h-auto object-contain"
        />
      </div>

      <NavIcon item={navItems[2]} />
      <NavIcon item={navItems[3]} />
    </nav>
  );
}