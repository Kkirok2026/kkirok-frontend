import { NavLink, useLocation } from "react-router-dom";

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
      activeSize: { width: 27.52, height: 35.48 },
      inactiveSize: { width: 24, height: 24 },
      preserveDate: true,
    },
  
  {
    to: "/search",
    label: "검색",
    activeIcon: SearchActiveIcon,
    inactiveIcon: SearchInactiveIcon,
    activeSize: { width: 24, height: 31.97 },
    inactiveSize: { width: 24, height: 24 },
  },
  {
    to: "/university-meal",
    label: "식단",
    activeIcon: MealActiveIcon,
    inactiveIcon: MealInactiveIcon,
    activeSize: { width: 24, height: 31.97 },
    inactiveSize: { width: 24, height: 24 },
    preserveDate: true,
  },
  {
    to: "/profile",
    label: "프로필",
    activeIcon: ProfileActiveIcon,
    inactiveIcon: ProfileInactiveIcon,
    activeSize: { width: 27.52, height: 33.41 },
    inactiveSize: { width: 27.52, height: 27.47 },
  },
];

const ICON_TOP = 43.49;

function navTarget(item, search) {
  if (!item.preserveDate) return item.to;

  const params = new URLSearchParams(search);
  const date = params.get("date");

  return date ? `${item.to}?date=${encodeURIComponent(date)}` : item.to;
}

function NavIcon({ item, search }) {
  return (
    <NavLink
      to={navTarget(item, search)}
      aria-label={item.label}
      className="relative block h-full w-full"
    >
      {({ isActive }) => {
        const size = isActive ? item.activeSize : item.inactiveSize;

        return (
          <img
            src={isActive ? item.activeIcon : item.inactiveIcon}
            alt=""
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              top: `${ICON_TOP}px`,
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 1,
            }}
            className="absolute object-contain"
          />
        );
      }}
    </NavLink>
  );
}

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 grid h-[86px] grid-cols-5 border-t border-[#f5f5f5] bg-white px-[22px]">
      <NavIcon item={navItems[0]} search={location.search} />
      <NavIcon item={navItems[1]} search={location.search} />

      <div className="relative flex h-full items-end justify-center overflow-visible">
        <img
          src={DuckNavImage}
          alt=""
          className="absolute bottom-[-5px] h-auto w-[58px] object-contain"
        />
      </div>

      <NavIcon item={navItems[2]} search={location.search} />
      <NavIcon item={navItems[3]} search={location.search} />
    </nav>
  );
}