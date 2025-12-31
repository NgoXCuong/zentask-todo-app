import {
  Home,
  LogOut,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  CheckSquare,
  ListTodo,
  Bell,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";

export default function Sidebar({ focusMode, stats, onToggleFocus, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Card
      className={`fixed left-0 top-0 rounded-none h-full border-r shadow-lg z-40 flex flex-col transition-all duration-300 ${
        focusMode ? "w-16" : "md:w-20 lg:w-64 w-64"
      }`}
    >
      <CardHeader className={`border-b ${focusMode ? "p-3" : "py-3"}`}>
        {focusMode ? (
          <div className="flex justify-center">
            <div
              className="w-8 h-8  rounded-xs flex items-center justify-center cursor-pointer"
              onClick={onToggleFocus}
            >
              <CheckSquare className="w-8 h-8 dark:text-white " />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-xs flex items-center justify-center">
              <CheckSquare className="w-10 h-10  dark:text-white " />
            </div>
            <div className="hidden md:block lg:block">
              <h1 className="text-2xl font-bold">ZenTask</h1>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent
        className={`flex-1 ${focusMode ? "px-2" : "px-4"} space-y-6`}
      >
        {/* Navigation */}
        <div className="space-y-2">
          <nav className="space-y-1">
            <Button
              variant={
                isActive("/") || isActive("/dashboard") ? "secondary" : "ghost"
              }
              className={`${
                focusMode
                  ? "w-12 h-12 p-0 justify-center"
                  : "w-full justify-start gap-3 px-3 py-2 h-12"
              } rounded-xs glass-effect ${
                isActive("/") || isActive("/dashboard")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => {
                navigate("/");
                if (window.innerWidth < 768) onClose(); // Close sidebar on mobile
              }}
              title={focusMode ? "Dashboard" : ""}
            >
              <Home className="w-4 h-4" />
              {!focusMode && (
                <span className="text-sm md:hidden lg:inline">Trang chủ</span>
              )}
            </Button>
            <Button
              variant={isActive("/tasks") ? "secondary" : "ghost"}
              className={`${
                focusMode
                  ? "w-12 h-12 p-0 justify-center"
                  : "w-full justify-start gap-3 px-3 py-2 h-12"
              } rounded-xs glass-effect ${
                isActive("/tasks")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => {
                navigate("/tasks");
                if (window.innerWidth < 768) onClose();
              }}
              title={focusMode ? "Tasks" : ""}
            >
              <ListTodo className="w-4 h-4" />
              {!focusMode && (
                <span className="text-sm md:hidden lg:inline">Tasks</span>
              )}
            </Button>
            <Button
              variant={isActive("/categories") ? "secondary" : "ghost"}
              className={`${
                focusMode
                  ? "w-12 h-12 p-0 justify-center"
                  : "w-full justify-start gap-3 px-3 py-2 h-12"
              } rounded-xs glass-effect ${
                isActive("/categories")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => {
                navigate("/categories");
                if (window.innerWidth < 768) onClose();
              }}
              title={focusMode ? "Danh mục" : ""}
            >
              <Tag className="w-4 h-4" />
              {!focusMode && (
                <span className="text-sm md:hidden lg:inline">Danh mục</span>
              )}
            </Button>
            <Button
              variant={isActive("/workspaces") ? "secondary" : "ghost"}
              className={`${
                focusMode
                  ? "w-12 h-12 p-0 justify-center"
                  : "w-full justify-start gap-3 px-3 py-2 h-12"
              } rounded-xs glass-effect ${
                isActive("/workspaces")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => {
                navigate("/workspaces");
                if (window.innerWidth < 768) onClose();
              }}
              title={focusMode ? "Workspaces" : ""}
            >
              <Users className="w-4 h-4" />
              {!focusMode && (
                <span className="text-sm md:hidden lg:inline">Workspaces</span>
              )}
            </Button>

            <Button
              variant={isActive("/activity-logs") ? "secondary" : "ghost"}
              className={`${
                focusMode
                  ? "w-12 h-12 p-0 justify-center"
                  : "w-full justify-start gap-3 px-3 py-2 h-12"
              } rounded-xs glass-effect ${
                isActive("/activity-logs")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => {
                navigate("/activity-logs");
                if (window.innerWidth < 768) onClose();
              }}
              title={focusMode ? "Lịch sử hoạt động" : ""}
            >
              <Activity className="w-4 h-4" />
              {!focusMode && (
                <span className="text-sm md:hidden lg:inline">Lịch sử</span>
              )}
            </Button>
          </nav>
        </div>
      </CardContent>

      <CardFooter className={`${focusMode ? "px-2" : "px-4"} border-t`}>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`${
            focusMode
              ? "w-12 h-12 p-0 justify-center"
              : "w-full justify-start gap-3 px-3 h-12"
          }  text-red-600  hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20`}
          title={focusMode ? "Đăng xuất" : ""}
        >
          <LogOut className="w-4 h-4" />
          {!focusMode && (
            <span className="text-sm md:hidden lg:inline">Đăng xuất</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
