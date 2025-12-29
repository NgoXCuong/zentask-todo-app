import { useState, useRef, useEffect } from "react";
import { Search, User, Focus, Plus, Sun, Moon, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../notifications/NotificationDropdown";
import AvatarUpdate from "./AvatarUpdate";

export default function Header({ focusMode, setFocusMode, user: propUser }) {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user: contextUser } = useAuth();

  // Use context user if available, otherwise fall back to prop
  const user = contextUser || propUser;
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showAvatarUpdate, setShowAvatarUpdate] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
        setShowAvatarUpdate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 bg-card border-b border-border shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            <Focus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <Button
            className={"rounded-xs"}
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? "Chuyên qua Light Mode" : "Chuyển qua Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
              className="flex items-center gap-2 hover:bg-accent rounded-xs p-2 transition-colors"
              title="Cài đặt tài khoản"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                {user?.avatar_url ? (
                  <>
                    <img
                      src={
                        user.avatar_url.startsWith("http")
                          ? user.avatar_url
                          : `http://localhost:3000${user.avatar_url}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Avatar load error:", user.avatar_url);
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-full h-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.full_name}
              </span>
            </button>

            {/* Avatar Dropdown Menu */}
            {showAvatarDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border border-border z-50">
                {!showAvatarUpdate ? (
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                        {user?.avatar_url ? (
                          <img
                            src={
                              user.avatar_url.startsWith("http")
                                ? user.avatar_url
                                : `http://localhost:3000${user.avatar_url}`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center ${
                            user?.avatar_url ? "hidden" : "flex"
                          }`}
                        >
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowAvatarUpdate(true)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Cập nhật ảnh đại diện
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <AvatarUpdate onClose={() => setShowAvatarUpdate(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
