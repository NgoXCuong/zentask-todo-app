import { Home, CheckSquare, Clock, AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Stats from "../tasks/Stats";

export default function Sidebar({ focusMode, stats }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (focusMode) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-lg z-40 flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-linear-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">ZenTask</h1>
        </div>

        <nav className="space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground bg-sidebar-accent rounded-lg"
          >
            <CheckSquare className="w-5 h-5" />
            Tasks
          </a>
        </nav>
      </div>

      <div className="p-6 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
