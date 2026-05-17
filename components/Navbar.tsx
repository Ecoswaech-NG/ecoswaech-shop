"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Icons
const LightningIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const ToolsIcon      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>;
const HomeIcon       = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UserCircleIcon = () => <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const UserIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MessageIcon    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const BellIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const SettingsIcon   = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const LogoutIcon     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const SunIcon        = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
const MoonIcon       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const MenuIcon       = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const ChevronDown    = ({ open }: { open: boolean }) => <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
const SellIcon       = () => <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;

export default function Navbar() {
  const { user, userLoggedIn, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname(); // Tracks the current URL
  const isDark = theme === "dark";

  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  const dropdownRef     = useRef<HTMLDivElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);

  // Close logic for dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest(".dropdown-toggle")) setDropdownOpen(false);
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [dropdownOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest(".shop-dropdown-toggle")) setShopDropdownOpen(false);
    };
    if (shopDropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shopDropdownOpen]);

  const handleLogout = async () => {
    try { await logout(); router.push("/login"); }
    catch (err) { console.error("Logout error:", err); }
  };

  // Function to determine if a link is active
  const isActive = (path: string) => pathname === path;

  // NavLink generator with Active States
  const getNavLinkClass = (path: string) => {
    const active = isActive(path);
    if (isDark) {
      return `flex-1 flex justify-center items-center px-2 py-2 rounded-full text-[12px] font-bold transition whitespace-nowrap tracking-tight ${
        active ? "bg-[#2d1e5f] text-white shadow-inner" : "text-[#e0d7ff] hover:bg-[#2d1e5f]/50"
      }`;
    }
    return `flex-1 flex justify-center items-center px-2 py-2 rounded-full text-[12px] font-bold transition whitespace-nowrap tracking-tight ${
      active ? "bg-gray-200 text-black shadow-inner" : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  const desktopBg = isDark
    ? "linear-gradient(135deg, rgba(10,8,34,0.85) 0%, rgba(24,18,43,0.8) 60%, rgba(45,30,95,0.7) 100%)"
    : "rgba(246,248,250,0.9)";

  const pillBg = isDark
    ? "bg-[#18122b]/80 border border-[#2d1e5f]"
    : "bg-white/80 border border-gray-200";

  return (
    <>
      <header
        className="hidden md:flex justify-between items-center px-6 py-3 sticky top-0 z-20 backdrop-blur-md"
        style={{ background: desktopBg, borderBottom: `1px solid ${isDark ? "#2d1e5f" : "#d0d7de"}` }}
      >
        <Link href="/home" className="flex-shrink-0">
          <Image src="/logo.svg" alt="Ecomart" width={48} height={48} className="w-12 h-12" />
        </Link>

        {/* PILL NAV: Now fills space perfectly with active indicators */}
        <nav className={`flex items-center justify-between ${pillBg} rounded-full shadow-lg px-1.5 py-1.5 mx-4 flex-1 max-w-5xl backdrop-blur-md`}>
          <Link href="/home"    className={getNavLinkClass("/home")}>HOME</Link>
          <Link href="/search"  className={getNavLinkClass("/search")}>SEARCH EVs</Link>

          <div className="relative flex-1 flex justify-center" ref={shopDropdownRef}>
            <button
              className={`shop-dropdown-toggle ${getNavLinkClass("/charging")} w-full gap-1`}
              onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
            >
              SHOP EVSE <ChevronDown open={shopDropdownOpen} />
            </button>
            {shopDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-48 bg-[#18122b] shadow-xl rounded-xl border border-[#2d1e5f] z-50 overflow-hidden">
                <Link href="/chargers"    className="flex px-5 py-3 text-xs hover:bg-[#2d1e5f] text-[#e0d7ff] items-center gap-2" onClick={() => setShopDropdownOpen(false)}><LightningIcon /> Chargers</Link>
                <Link href="/accessories" className="flex px-5 py-3 text-xs hover:bg-[#2d1e5f] text-[#e0d7ff] items-center gap-2" onClick={() => setShopDropdownOpen(false)}><ToolsIcon /> Accessories</Link>
              </div>
            )}
          </div>

          <Link href="/charging-stations"  className={getNavLinkClass("/charging-stations")}>CHARGE EVs</Link>
          <Link href="/rentals"   className={getNavLinkClass("/rentals")}>RENTALS</Link>
          <Link href="/logistics" className={getNavLinkClass("/logistics")}>LOGISTICS</Link>

          <Link href={userLoggedIn ? "/add-listing" : "/login"} className="flex-1 px-1">
            <span className={`block w-full text-center font-bold rounded-full py-2 shadow-xl transition text-[11px] whitespace-nowrap cursor-pointer ${
                isActive("/add-listing") ? "bg-[#00C8FF] text-[#220a77]" : "bg-gray-900 text-white hover:bg-[#00C8FF] hover:text-[#220a77]"
            }`}>
              SELL HERE
            </span>
          </Link>

          <Link href="/contact" className={getNavLinkClass("/contact")}>CONTACT</Link>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: isDark ? "#2d1e5f" : "#f0f2f4", border: `1px solid ${isDark ? "#4a3080" : "#d0d7de"}`, color: isDark ? "#e0d7ff" : "#656d76" }}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {userLoggedIn ? (
            <div className="relative">
              <button className="dropdown-toggle" onClick={() => setDropdownOpen((o) => !o)}>
                <span style={{ color: isDark ? "#e0d7ff" : "#220a77" }}><UserCircleIcon /></span>
              </button>
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-56 bg-[#18122b] shadow-lg rounded-xl border border-[#2d1e5f] z-50">
                  <div className="px-5 py-3 border-b border-[#2d1e5f]">
                    <p className="text-xs text-[#e0d7ff] font-semibold truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-[#9b8ec4] truncate">{user?.email}</p>
                  </div>
                  {[
                    { label: "Profile",          icon: <UserIcon />,     href: "/user/dashboard" },
                    { label: "Messages",         icon: <MessageIcon />,  href: "/messages" },
                    { label: "Notifications",    icon: <BellIcon />,     href: "/notifications" },
                    { label: "Battery Passport", icon: <SettingsIcon />, href: "/dashboard" },
                    { label: "Settings",         icon: <SettingsIcon />, href: "/settings" },
                  ].map(({ label, icon, href }) => (
                    <Link key={label} href={href} onClick={() => setDropdownOpen(false)}
                      className="flex px-5 py-3 text-sm hover:bg-[#2d1e5f] text-[#e0d7ff] items-center gap-2">
                      {icon} {label}
                    </Link>
                  ))}
                  <button onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="w-full text-left px-5 py-3 text-sm hover:bg-[#2d1e5f] text-[#ff4d67] flex items-center gap-2 rounded-b-xl">
                    <LogoutIcon /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <span className="inline-block bg-[#7b2ff2] text-white hover:bg-[#00C8FF] hover:text-[#2d1e5f] transition rounded-full px-5 py-2 text-[12px] font-bold whitespace-nowrap cursor-pointer">
                Sign In / Register
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* MOBILE SECTION (Unchanged) */}
      <div className="flex justify-between items-center p-3 sticky top-0 z-30 md:hidden shadow-xl backdrop-blur-md"
        style={{ background: isDark ? "linear-gradient(135deg,rgba(10,8,34,0.85),rgba(45,30,95,0.65))" : "rgba(246,248,250,0.9)", borderBottom: `1px solid ${isDark ? "#2d1e5f" : "#d0d7de"}` }}>
        <Link href="/home">
          <Image src="/logo.svg" alt="Ecomart" width={40} height={40} className="w-10 h-10" />
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isDark ? "#2d1e5f" : "#f0f2f4", color: isDark ? "#e0d7ff" : "#656d76" }}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => setMobileMenuOpen((o) => !o)} className="p-2"
            style={{ color: isDark ? "#e0d7ff" : "#220a77" }}>
            <MenuIcon />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#18122b] shadow-lg border-t border-[#2d1e5f] z-40">
            {[
              { href: "/search",      icon: <SearchIcon />,    label: "Search EVs" },
              { href: "/charging",    icon: <LightningIcon />, label: "Chargers" },
              { href: "/accessories", icon: <ToolsIcon />,     label: "Accessories" },
              { href: "/chargers",    icon: <LightningIcon />, label: "Charge EVs" },
              { href: "/rentals",     icon: <LightningIcon />, label: "EV Rentals" },
              { href: "/logistics",   icon: <LightningIcon />, label: "EV Logistics" },
              { href: "/dashboard",   icon: <SettingsIcon />,  label: "Battery Passport" },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className={`flex px-6 py-4 items-center gap-3 text-sm ${isActive(href) ? "bg-[#2d1e5f] text-white" : "text-[#e0d7ff]"}`}>
                {icon} {label}
              </Link>
            ))}
            <div className="border-t border-[#2d1e5f]">
              {userLoggedIn ? (
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-6 py-4 text-sm hover:bg-[#2d1e5f] text-[#ff4d67] flex items-center gap-3">
                  <LogoutIcon /> Logout
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className="flex px-6 py-4 text-[#e0d7ff] hover:bg-[#2d1e5f] items-center gap-3 text-sm font-semibold">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#18122b] rounded-t-2xl shadow-2xl justify-between items-center px-6 border-t border-[#2d1e5f]"
        style={{ minHeight: 70, paddingTop: 16, paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
        <Link href="/home" className={`flex flex-col items-center flex-1 ${isActive("/home") ? "text-[#00C8FF]" : "text-[#e0d7ff]"}`}>
          <HomeIcon /><span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center flex-1 ${isActive("/search") ? "text-[#00C8FF]" : "text-[#e0d7ff]"}`}>
          <SearchIcon /><span className="text-[10px] mt-1">Search</span>
        </Link>
        <div className="relative flex flex-col items-center flex-1 z-10 cursor-pointer"
          onClick={() => router.push(userLoggedIn ? "/add-listing" : "/login")}>
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl rotate-45 -mt-8 shadow-lg border-2 border-white transition-all ${isActive("/add-listing") ? "bg-[#00C8FF]" : "bg-[#220a77]"}`}>
            <div className="-rotate-45"><SellIcon /></div>
          </div>
          <span className="text-[10px] mt-2 font-semibold text-white">{userLoggedIn ? "SELL" : "SIGN IN"}</span>
        </div>
        <Link href="/messages" className={`flex flex-col items-center flex-1 ${isActive("/messages") ? "text-[#00C8FF]" : "text-[#e0d7ff]"}`}>
          <MessageIcon /><span className="text-[10px] mt-1">Messages</span>
        </Link>
        <Link href="/user/dashboard" className={`flex flex-col items-center flex-1 ${isActive("/user/dashboard") ? "text-[#00C8FF]" : "text-[#e0d7ff]"}`}>
          <UserCircleIcon /><span className="text-[10px] mt-1">Profile</span>
        </Link>
      </div>
    </>
  );
}