import { useState, useEffect } from "react";
import { tasksAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TaskList from "../components/tasks/TaskList";
import TaskControls from "../components/tasks/TaskControls";
import KanbanBoard from "../components/tasks/KanbanBoard";
import AddTaskForm from "../components/tasks/AddTaskForm";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import Message from "../components/tasks/Message";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Search,
  User,
  Focus,
  Plus,
  Sun,
  Moon,
  List,
  Kanban,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState({ title: "", status: "" });
  const [viewingTask, setViewingTask] = useState(null);
  const [message, setMessage] = useState({
    text: "",
    isError: false,
    show: false,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"
  const limit = 10; // Show more tasks per page on dedicated tasks page
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const tasksRes = await tasksAPI.getAll({
        page,
        limit,
        status: filter,
        keyword,
        sort_by: sortBy,
        order,
        start_date: startDate,
        end_date: endDate,
        priority,
        category_id: categoryId,
      });

      if (tasksRes.ok) {
        setTasks(tasksRes.data.data || []);
        setTotalPages(tasksRes.data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    page,
    filter,
    keyword,
    sortBy,
    order,
    startDate,
    endDate,
    priority,
    categoryId,
  ]);

  const showMsg = (text, isError = false) => {
    setMessage({ text, isError, show: true });
    setTimeout(() => setMessage((m) => ({ ...m, show: false })), 3000);
  };

  const deleteTask = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    const { ok } = await tasksAPI.delete(id);
    if (ok) {
      showMsg("Đã xóa!");
      loadData();
    } else {
      showMsg("Xóa thất bại!", true);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTask({ title: task.title, status: task.status });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(!focusMode)}
      />

      {/* Main Content */}
      <div className={`flex-1 ${!focusMode ? "ml-64" : "ml-16"}`}>
        {/* Custom Header for Tasks Page */}
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

            <div className="flex items-center gap-4">
              <Button
                className={"rounded-sm"}
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={
                  isDark ? "Chuyển qua Light Mode" : "Chuyển qua Dark Mode"
                }
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

        <main className="p-6 space-y-6">
          <Message message={message} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quản lý Tasks
              </h1>
              <p className="text-muted-foreground mt-1">
                Xem và quản lý tất cả các công việc của bạn
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Task
            </Button>
          </div>

          {/* Task Board Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bảng Quản lý Task</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quản lý các công việc của bạn theo các giai đoạn khác nhau
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Danh sách
                  </Button>
                  <Button
                    variant={viewMode === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                  >
                    <Kanban className="w-4 h-4 mr-2" />
                    Kanban
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TaskControls
                filter={filter}
                setFilter={setFilter}
                keyword={keyword}
                setKeyword={setKeyword}
                sortBy={sortBy}
                setSortBy={setSortBy}
                order={order}
                setOrder={setOrder}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                priority={priority}
                setPriority={setPriority}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                setPage={setPage}
              />
              {viewMode === "list" ? (
                <TaskList
                  tasks={tasks}
                  loading={loading}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  editTask={editTask}
                  setEditTask={setEditTask}
                  loadData={loadData}
                  showMsg={showMsg}
                  setViewingTask={setViewingTask}
                />
              ) : (
                <KanbanBoard
                  kanbanTasks={{
                    pending: tasks.filter((task) => task.status === "pending"),
                    inprogress: tasks.filter(
                      (task) => task.status === "inprogress"
                    ),
                    completed: tasks.filter(
                      (task) => task.status === "completed"
                    ),
                  }}
                  setViewingTask={setViewingTask}
                  startEdit={startEdit}
                  deleteTask={deleteTask}
                />
              )}
            </CardContent>
          </Card>

          {/* Modals */}
          <AddTaskForm
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            loadData={loadData}
            showMsg={showMsg}
          />

          <TaskDetailsModal
            viewingTask={viewingTask}
            setViewingTask={setViewingTask}
            startEdit={startEdit}
            deleteTask={deleteTask}
          />
        </main>
      </div>
    </div>
  );
}
