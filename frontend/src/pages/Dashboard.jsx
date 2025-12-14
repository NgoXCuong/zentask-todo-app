import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tasksAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Message from "../components/tasks/Message";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import TaskList from "../components/tasks/TaskList";
import TaskControls from "../components/tasks/TaskControls";
import AddTaskForm from "../components/tasks/AddTaskForm";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckSquare, Clock, TrendingUp, Plus, Tag } from "lucide-react";

export default function ZenTaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inprogress: 0,
    completed: 0,
    review: 0,
  });
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
  const limit = 5;
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we should open the add form (from navigation state)
  useEffect(() => {
    if (location.state?.openAddForm) {
      setShowAddForm(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll({
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
        }),
        tasksAPI.getStats(),
      ]);

      if (tasksRes.ok) {
        setTasks(tasksRes.data.data || []);
        setTotalPages(tasksRes.data.meta?.totalPages || 1);
      }
      if (statsRes.ok) {
        setStats(
          statsRes.data.stats || { pending: 0, inprogress: 0, completed: 0 }
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
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

  // Group tasks by status for Kanban
  const kanbanTasks = {
    pending: tasks.filter((task) => task.status === "pending"),
    inprogress: tasks.filter((task) => task.status === "inprogress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar focusMode={focusMode} stats={stats} />

      {/* Main Content */}
      <div className={`flex-1 ${!focusMode ? "ml-64" : ""}`}>
        <Header focusMode={focusMode} setFocusMode={setFocusMode} user={user} />

        <main className="p-6 space-y-6">
          <Message message={message} />

          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Chào mừng trở lại, {user?.full_name || "User"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your tasks today.
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tasks
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pending +
                    stats.inprogress +
                    stats.completed +
                    stats.review}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tất cả các công việc của bạn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhiệm vụ đang chờ bắt đầu
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.inprogress}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hiện đang làm việc
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats.completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhiệm vụ đã hoàn thành thành công
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/tasks")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Xem Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quản lý và xem tất cả các công việc của bạn
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowAddForm(true)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Thêm Task mới
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tạo công việc mới nhanh chóng
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/categories")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Quản lý Danh mục
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tạo và chỉnh sửa các danh mục công việc
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks Preview */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tasks gần đây</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem nhanh các công việc mới nhất
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                      onClick={() => setViewingTask(task)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.status === "completed"
                              ? "bg-green-500"
                              : task.status === "inprogress"
                              ? "bg-blue-500"
                              : "bg-orange-500"
                          }`}
                        />
                        <span className="font-medium">{task.title}</span>
                        {task.category && (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: task.category.color + "20",
                              color: task.category.color,
                            }}
                          >
                            {task.category.name}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
                {tasks.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/tasks")}
                    >
                      Xem tất cả ({tasks.length} tasks)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
