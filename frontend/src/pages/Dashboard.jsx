import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { tasksAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ZenTaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inprogress: 0,
    completed: 0,
  });
  const [filter, setFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({
    text: "",
    isError: false,
    show: false,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 5;
  const debounceRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // New task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
  });
  const [editTask, setEditTask] = useState({ title: "", status: "" });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll({ page, limit, status: filter, keyword }),
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
  }, [page, filter, keyword]);

  const showMsg = (text, isError = false) => {
    setMessage({ text, isError, show: true });
    setTimeout(() => setMessage((m) => ({ ...m, show: false })), 3000);
  };

  const handleSearch = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      showMsg("Vui lòng nhập tiêu đề!", true);
      return;
    }

    const { ok } = await tasksAPI.create(newTask);
    if (ok) {
      showMsg("Thêm thành công!");
      setShowAddForm(false);
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        due_date: "",
      });
      loadData();
    } else {
      showMsg("Thêm thất bại!", true);
    }
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

  const saveEdit = async (id) => {
    const { ok } = await tasksAPI.update(id, editTask);
    if (ok) {
      showMsg("Đã cập nhật!");
      setEditingId(null);
      loadData();
    } else {
      showMsg("Cập nhật thất bại!", true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTask({ title: task.title, status: task.status });
  };

  const statusClass = {
    pending: "bg-yellow-100 text-yellow-800",
    inprogress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 to-purple-600 py-5">
      <div className="max-w-4xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-5 text-white">
          <h1 className="text-4xl font-bold drop-shadow-lg">🚀 Zen Task Pro</h1>
          <p className="opacity-90">Quản lý công việc thông minh</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl">
          {/* User Header */}
          <div>
            <h3>Xin chào, {user?.full_name}! 👋</h3>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>

          {/* Message */}
          {message.show && (
            <div
              className={`p-3 rounded-lg mb-4 text-center ${
                message.isError
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl text-center text-white bg-linear-to-r from-yellow-400 to-orange-400 shadow hover:-translate-y-1 transition">
              <p className="text-sm opacity-90">Chưa bắt đầu</p>
              <h2 className="text-3xl font-bold">{stats.pending}</h2>
            </div>
            <div className="p-4 rounded-xl text-center text-white bg-linear-to-r from-cyan-400 to-blue-500 shadow hover:-translate-y-1 transition">
              <p className="text-sm opacity-90">Đang làm</p>
              <h2 className="text-3xl font-bold">{stats.inprogress}</h2>
            </div>
            <div className="p-4 rounded-xl text-center text-white bg-linear-to-r from-emerald-400 to-teal-500 shadow hover:-translate-y-1 transition">
              <p className="text-sm opacity-90">Hoàn thành</p>
              <h2 className="text-3xl font-bold">{stats.completed}</h2>
            </div>
          </div>

          {/* Add Task Toggle */}
          <div
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gray-100 p-4 rounded-lg cursor-pointer text-center font-bold text-indigo-600 hover:bg-gray-200 transition mb-5"
          >
            + Thêm công việc mới
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-5 bg-gray-50 p-5 rounded-lg">
              <input
                type="text"
                placeholder="Tiêu đề công việc..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Mô tả chi tiết..."
                rows={2}
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-3 mb-3">
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={createTask}
                className="w-full py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition"
              >
                Lưu công việc
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-5 justify-between items-center">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["", "pending", "inprogress", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === s
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === ""
                    ? "Tất cả"
                    : s === "pending"
                    ? "Chờ"
                    : s === "inprogress"
                    ? "Đang làm"
                    : "Xong"}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-gray-500 py-8">
              Đang tải dữ liệu...
            </div>
          )}

          {/* Task List */}
          {!loading && tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Không tìm thấy công việc nào.
            </div>
          ) : (
            !loading &&
            tasks.map((t) => (
              <div
                key={t.id}
                className="flex justify-between p-4 border border-gray-200 rounded-lg mb-3 hover:border-indigo-400 hover:shadow transition"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t.title}</h4>
                  <p className="text-gray-500 text-sm mb-2">{t.description}</p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        statusClass[t.status]
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      📅{" "}
                      {t.due_date
                        ? new Date(t.due_date).toLocaleDateString()
                        : "Không thời hạn"}
                    </span>
                  </div>
                  {editingId === t.id && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <input
                        value={editTask.title}
                        onChange={(e) =>
                          setEditTask({ ...editTask, title: e.target.value })
                        }
                        className="w-full p-2 border border-gray-200 rounded mb-2"
                      />
                      <select
                        value={editTask.status}
                        onChange={(e) =>
                          setEditTask({ ...editTask, status: e.target.value })
                        }
                        className="w-full p-2 border border-gray-200 rounded mb-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-3">
                  <button
                    onClick={() => startEdit(t)}
                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === i + 1 ? "bg-indigo-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
