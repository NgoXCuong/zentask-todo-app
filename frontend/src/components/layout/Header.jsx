import { Search, User, Focus, Plus } from "lucide-react";

export default function Header({
  focusMode,
  setFocusMode,
  keyword,
  setKeyword,
  setShowAddForm,
  user,
}) {
  return (
    <header className="sticky top-0 bg-card border-b border-border shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            <Focus className="w-5 h-5" />
          </button>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>

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
