import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Carelogo from "../../../public/careLogo.png";


import UsersIcon from '../../../public/people.svg?react';
import ActivitiesIcon from '../../../public/3dcube.svg?react';
import EarningsIcon from '../../../public/wallet-check.svg?react';
import SubscriptionIcon from '../../../public/cards.svg?react';
import SupportIcon from '../../../public/message-question.svg?react';
import ProfileIcon from '../../../public/profile-tick.svg?react';
import MessageNotifyIcon from '../../../public/message-notif.svg?react';

const navItems = [
  { to: '/admin/users', label: 'Users', icon: <UsersIcon className="w-5 h-5" /> },
  { to: '/admin/activities', label: 'Activities', icon: <ActivitiesIcon className="w-5 h-5" /> },
  { to: '/admin/earnings', label: 'Earnings', icon: <EarningsIcon className="w-5 h-5" /> },
  { to: '/admin/subscription', label: 'Subscription', icon: <SubscriptionIcon className="w-5 h-5" /> },
  { to: '/admin/support', label: 'Support', icon: <SupportIcon className="w-5 h-5" /> },
  // Profile Verification handled separately to allow submenu
];

function Sidebar() {
  const [openProfile, setOpenProfile] = useState(true)

  return (
    <aside className="h-screen w-56 bg-[#0e2f43] text-white flex flex-col font-sfpro">
      <div className="px-4 py-6 mb-4 flex items-center space-x-2">
        {/* Placeholder for logo */}
        <img src={Carelogo} alt="CareNestPro Logo" className="w-8 h-8 " />
        <span className="text-lg ">CareNestPro</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `flex items-center px-4 py-3 text-xs rounded-md transition-colors duration-150 hover:bg-[#1d4353] ${isActive ? 'bg-[#567180]' : ''}`}
              >
                <span className="mr-3 text-base ">{item.icon}</span>
                <span className="leading-none tracking-wide text-md">{item.label}</span>
              </NavLink>
            </li>
          ))}

          {/* Profile Verification with submenu */}
          <li>
            <div
              role="button"
              onClick={() => setOpenProfile((s) => !s)}
              className="flex items-center px-4 py-3 text-xs rounded-md transition-colors duration-150 hover:bg-[#1d4353] cursor-pointer"
            >
              <span className="mr-3 text-base "><ProfileIcon className="w-5 h-5" /></span>
              <span className="leading-none tracking-wide text-md flex-1">Profile Verification</span>
              <span className="text-sm opacity-80">{openProfile ? '▾' : '▸'}</span>
            </div>

            {openProfile && (
              <ul className="ml-8 mt-2 space-y-1">
                <li>
                  <NavLink to={'/admin/profile-verification/care-seekers'} className={({ isActive }) => `block px-3 py-2 rounded text-sm transition-colors duration-150 hover:bg-[#1d4353] ${isActive ? 'bg-[#567180]' : ''}`}>
                    Care Seekers
                  </NavLink>
                </li>
                <li>
                  <NavLink to={'/admin/profile-verification/care-providers'} className={({ isActive }) => `block px-3 py-2 rounded text-sm transition-colors duration-150 hover:bg-[#1d4353] ${isActive ? 'bg-[#567180]' : ''}`}>
                    Care Providers
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
            <li>
              <NavLink
                to={'/admin/messages'}
                className={({ isActive }) => `flex items-center px-4 py-3 text-xs rounded-md transition-colors duration-150 hover:bg-[#1d4353] ${isActive ? 'bg-[#567180]' : ''}`}
              >
                <span className="mr-3 text-base "><MessageNotifyIcon className="w-5 h-5" /></span>
                <span className="leading-none tracking-wide text-md">Notifications & Messages</span>
              </NavLink>
            </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
