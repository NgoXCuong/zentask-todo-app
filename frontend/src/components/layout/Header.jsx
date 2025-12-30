import { useState } from "react";
import {
  Search,
  User,
  Focus,
  Plus,
  Sun,
  Moon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent } from "../ui/card";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../notifications/NotificationDropdown";
import AvatarUpdate from "./AvatarUpdate";

export default function Header({ focusMode, setFocusMode, user: propUser }) {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user: contextUser } = useAuth();

  // Use context user if available, otherwise fall back to prop
  const user = contextUser || propUser;
  const [showAvatarUpdate, setShowAvatarUpdate] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 bg-card border-b border-border shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div
            className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {focusMode ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <div
            className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
            onClick={toggleTheme}
            title={isDark ? "Chuyên qua Light Mode" : "Chuyển qua Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </div>

          {/* User Avatar Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <div
                className="flex items-center gap-2 hover:bg-accent rounded-md p-2 h-auto cursor-pointer transition-colors"
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
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Card className="border-0 shadow-none">
                <CardContent className="p-4">
                  {!showAvatarUpdate ? (
                    <>
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
                          <p className="font-medium text-sm">
                            {user?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full  justify-start gap-2 h-8"
                          onClick={() => setShowAvatarUpdate(true)}
                        >
                          <Settings className="w-4 h-4" />
                          Cập nhật ảnh đại diện
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive"
                          onClick={handleLogout}
                        >
                          Đăng xuất
                        </Button>
                      </div>
                    </>
                  ) : (
                    <AvatarUpdate onClose={() => setShowAvatarUpdate(false)} />
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
