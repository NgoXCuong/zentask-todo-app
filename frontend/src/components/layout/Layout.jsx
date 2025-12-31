import { useLayout } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const { focusMode, setFocusMode } = useLayout();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWidth = focusMode ? "md:w-16" : "md:w-16 lg:w-64";

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar cố định */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          bg-background
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          w-64 ${focusMode ? "md:w-16" : "lg:w-64"}
        `}
      >
        <Sidebar focusMode={focusMode} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div
        className={`
          flex flex-col flex-1
          transition-all duration-300
          ml-0 md:ml-16 ${!focusMode ? "lg:ml-64" : ""}
        `}
      >
        {/* Header cố định */}
        <Header
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Nội dung CUỘN */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
