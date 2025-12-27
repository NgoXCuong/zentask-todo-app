import { useLayout } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const { focusMode, setFocusMode } = useLayout();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar focusMode={focusMode} />

      {/* Main Content */}
      <div className={`flex-1 ${!focusMode ? "ml-64" : "ml-16"}`}>
        <Header focusMode={focusMode} setFocusMode={setFocusMode} user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
