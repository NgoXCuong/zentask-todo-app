import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { tasksAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";
import TaskList from "../components/tasks/TaskList";
import TaskControls from "../components/tasks/TaskControls";
import KanbanBoard from "../components/tasks/KanbanBoard";
import AddTaskForm from "../components/tasks/AddTaskForm";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import Message from "../components/tasks/Message";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, List, Kanban } from "lucide-react";

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
  const [workspaceId, setWorkspaceId] = useState("");
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
  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"
  const limit = 10; // Show more tasks per page on dedicated tasks page
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Set initial workspace filter from URL params
  useEffect(() => {
    const workspaceParam = searchParams.get("workspace");
    if (workspaceParam) {
      setWorkspaceId(workspaceParam);
    }
  }, [searchParams]);

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
        workspace_id: workspaceId,
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
    workspaceId,
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
    <Layout>
      <Message message={message} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Tasks</h1>
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
              <CardTitle className="font-bold text-xl">
                Bảng Quản lý Task
              </CardTitle>
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
            workspaceId={workspaceId}
            setWorkspaceId={setWorkspaceId}
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
                completed: tasks.filter((task) => task.status === "completed"),
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
    </Layout>
  );
}
