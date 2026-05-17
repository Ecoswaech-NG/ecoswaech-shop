"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import MyListings from "@/components/dashboard/MyListings";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { MyFavorites, MyRentals, MyLogistics } from "@/components/dashboard/DashComponents";
import SwaechIDTab from "@/components/dashboard/SwaechIDTab";
import Inbox from "@/components/inbox/Inbox";
import { useAuth } from "@/context/AuthContext";

import {
  RiHome4Line,
  RiInboxLine,
  RiUserLine,
  RiHeartLine,
  RiCarLine,
  RiTruckLine,
  RiCloseLine,
  RiShieldUserLine,
} from "react-icons/ri";

import { PiDotsNineDuotone } from "react-icons/pi";

type Tab =
  | "my-listings"
  | "inbox"
  | "profile"
  | "favorites"
  | "my-rentals"
  | "my-logistics"
  | "swaech-id";

const NAV_ITEMS: { id: Tab; label: string; Icon: any }[] = [
  { id: "my-listings", label: "Listings", Icon: RiHome4Line },
  { id: "inbox", label: "Inbox", Icon: RiInboxLine },
  { id: "profile", label: "Profile", Icon: RiUserLine },
  { id: "favorites", label: "Favorites", Icon: RiHeartLine },
  { id: "my-rentals", label: "My Rentals", Icon: RiCarLine },
  { id: "my-logistics", label: "My Logistics", Icon: RiTruckLine },
  { id: "swaech-id", label: "SWAECH ID", Icon: RiShieldUserLine },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { user, userLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) ?? "my-listings"
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabSelect = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my-listings":
        return <MyListings />;
      case "inbox":
        return <Inbox />;
      case "profile":
        return <ProfileTab />;
      case "favorites":
        return <MyFavorites />;
      case "my-rentals":
        return <MyRentals />;
      case "my-logistics":
        return <MyLogistics />;
      case "swaech-id":
        return <SwaechIDTab />;
      default:
        return <MyListings />;
    }
  };

  if (!userLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-4xl mb-4">🔒</p>
            <p className="font-semibold text-gray-700 dark:text-white text-lg">
              Sign in to access your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] pb-24 md:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
            Welcome back, {user?.fullName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-gray-400 dark:text-[#8b949e] mt-0.5">
            {user?.email}
          </p>
        </div>

        <div className="flex gap-6 relative">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-4 shadow-sm">
              <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, Icon }) =>
                  id === "swaech-id" ? (
                    <button
                      key={id}
                      onClick={() => handleTabSelect(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                        activeTab === id
                          ? "bg-gradient-to-r from-[#7b2ff2] to-[#220a77] text-white shadow border-[#7b2ff2]"
                          : "text-gray-600 dark:text-[#c4b8e8] hover:bg-[#7b2ff2]/10 border-[#7b2ff2]/30"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{label}</span>
                      <span className="ml-auto text-[9px] font-bold bg-[#7b2ff2]/20 text-[#7b2ff2] px-1.5 py-0.5 rounded-full">
                        ID
                      </span>
                    </button>
                  ) : (
                    <button
                      key={id}
                      onClick={() => handleTabSelect(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                        activeTab === id
                          ? "bg-[#7b2ff2] text-white shadow"
                          : "text-gray-600 dark:text-[#c4b8e8] hover:bg-gray-50 dark:hover:bg-[#2d1e5f]/40"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {label}
                    </button>
                  )
                )}
              </nav>
            </div>
          </aside>

          {/* ── Mobile Overlay ── */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Mobile Sidebar ── */}
          <aside
            className={`
              fixed top-0 left-0 h-full w-72 z-50 md:hidden
              bg-white dark:bg-[#18122b] shadow-2xl border-r border-gray-100 dark:border-[#2d1e5f]
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-[#2d1e5f]">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-400 dark:text-[#8b949e]">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map(({ id, label, Icon }) =>
                id === "swaech-id" ? (
                  <button
                    key={id}
                    onClick={() => handleTabSelect(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                      activeTab === id
                        ? "bg-gradient-to-r from-[#7b2ff2] to-[#220a77] text-white shadow border-[#7b2ff2]"
                        : "text-gray-600 dark:text-[#c4b8e8] hover:bg-[#7b2ff2]/10 border-[#7b2ff2]/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                    <span className="ml-auto text-[9px] font-bold bg-[#7b2ff2]/20 text-[#7b2ff2] px-1.5 py-0.5 rounded-full">
                      ID
                    </span>
                  </button>
                ) : (
                  <button
                    key={id}
                    onClick={() => handleTabSelect(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                      activeTab === id
                        ? "bg-[#7b2ff2] text-white shadow"
                        : "text-gray-600 dark:text-[#c4b8e8] hover:bg-gray-50 dark:hover:bg-[#2d1e5f]/40"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                )
              )}
            </nav>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">{renderContent()}</main>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed left-4 bottom-24 z-30 bg-[#7b2ff2] text-white p-3.5 rounded-full shadow-lg hover:bg-[#651fff] transition-all"
      >
        <PiDotsNineDuotone className="w-6 h-6" />
      </button>
    </div>
  );
}