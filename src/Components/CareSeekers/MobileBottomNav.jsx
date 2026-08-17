import { PiSquaresFour } from "react-icons/pi";
import { MdOutlineSettings } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import Triangle from "../../../public/triangle.svg";
import Message from "../../../public/receipt-text.svg";

const items = [
  { label: "Home", path: "/careseekers/dashboard/home", icon: PiSquaresFour },
  { label: "Requests", path: "/careseekers/dashboard/requests", image: Triangle },
  { label: "Message", path: "/careseekers/dashboard/message", image: Message },
  { label: "Settings", path: "/careseekers/dashboard/settings", icon: MdOutlineSettings },
];

function MobileBottomNav({ active }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#edf0f2] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const isActive = active === item.label || location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex min-h-[72px] flex-col items-center justify-center gap-1 text-[12px] ${
              isActive ? "text-[#0d99c9]" : "text-[#9294b5]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className={`h-[22px] w-[22px] ${isActive ? "opacity-100" : "opacity-70"}`}
              />
            ) : (
              <Icon className="h-[22px] w-[22px]" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
