import { Search, User, Focus, Plus, Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTheme } from "../../context/ThemeContext";

export default function Header({
  focusMode,
  setFocusMode,
  keyword,
  setKeyword,
  setShowAddForm,
  user,
}) {
  const { isDark, toggleTheme } = useTheme();

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

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4" />
            Thêm Task
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className={"rounded-sm"}
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">{user?.full_name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
