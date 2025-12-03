import { useState, useEffect } from "react";
import { tasksAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Message from "../components/tasks/Message";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import KanbanBoard from "../components/tasks/KanbanBoard";
import AddTaskForm from "../components/tasks/AddTaskForm";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";

export default function ZenTaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inprogress: 0,
    completed: 0,
  });
  const [filter, setFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
  }, [page, filter, keyword, sortBy, order, startDate, endDate]);

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
        <Header
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          keyword={keyword}
          setKeyword={setKeyword}
          setShowAddForm={setShowAddForm}
          user={user}
        />

        <main className="p-6">
          <Message message={message} />

          <KanbanBoard
            kanbanTasks={kanbanTasks}
            setViewingTask={setViewingTask}
            startEdit={startEdit}
            deleteTask={deleteTask}
          />

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
