import { Home, LogOut, Tag, CheckSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";

export default function Sidebar({ focusMode, stats }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (focusMode) return null;

  return (
    <Card className="fixed left-0 top-0 h-full w-64 border-r shadow-lg z-40 flex flex-col">
      <CardHeader className=" border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-r from-primary to-purple-600 rounded-xs flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ZenTask</h1>
            <p className="text-xs text-muted-foreground">Task Management</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 space-y-6">
        {/* Navigation */}
        <div className="space-y-2">
          <nav className="space-y-1">
            <Button
              variant={
                isActive("/") || isActive("/dashboard") ? "secondary" : "ghost"
              }
              className={`w-full rounded-xs justify-start gap-3 px-3 py-2 h-auto ${
                isActive("/") || isActive("/dashboard")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Button>
            <Button
              variant={isActive("/tasks") ? "secondary" : "ghost"}
              className={`w-full rounded-xs justify-start gap-3 px-3 py-2 h-auto ${
                isActive("/tasks")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => navigate("/tasks")}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="text-sm">Tasks</span>
            </Button>
            <Button
              variant={isActive("/categories") ? "secondary" : "ghost"}
              className={`w-full rounded-xs justify-start gap-3 px-3 py-2 h-auto ${
                isActive("/categories")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  : ""
              }`}
              onClick={() => navigate("/categories")}
            >
              <Tag className="w-4 h-4" />
              <span className="text-sm">Danh mục</span>
            </Button>
          </nav>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Đăng xuất</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
