import { useLayout } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const { focusMode, setFocusMode } = useLayout();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
        ${focusMode ? "w-16" : "md:w-16 lg:w-64"}
      `}
      >
        <Sidebar focusMode={focusMode} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className={`
        flex-1 transition-all duration-300 ease-in-out
        ml-0
      `}
      >
        <Header
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
