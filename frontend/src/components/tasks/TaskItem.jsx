import { useState } from "react";
import { tasksAPI } from "../../services/api";
import { Card, CardContent } from "../ui/card";

export default function TaskItem({
  task,
  editingId,
  setEditingId,
  editTask,
  setEditTask,
  loadData,
  showMsg,
  setViewingTask,
}) {
  const [localEditTask, setLocalEditTask] = useState(editTask);
  const [expanded, setExpanded] = useState(false);

  // Mock data for new fields
  const mockTask = {
    ...task,
    priority: task.priority || "medium",
    tags: task.tags || ["work", "urgent"],
    subtasks: task.subtasks || [
      { id: 1, title: "Subtask 1", completed: false },
      { id: 2, title: "Subtask 2", completed: true },
    ],
    started_at:
      task.started_at ||
      (task.status === "inprogress" ? new Date().toISOString() : null),
    completed_at:
      task.completed_at ||
      (task.status === "completed" ? new Date().toISOString() : null),
    total_time: task.total_time || 120, // minutes
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
    const { ok } = await tasksAPI.update(id, localEditTask);
    if (ok) {
      showMsg("Đã cập nhật!");
      setEditingId(null);
      loadData();
    } else {
      showMsg("Cập nhật thất bại!", true);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setLocalEditTask({ title: task.title, status: task.status });
  };

  const statusClass = {
    pending: "bg-yellow-100 text-yellow-800",
    inprogress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const priorityClass = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{mockTask.title}</h4>
            <p className="text-gray-500 text-sm mb-2">{mockTask.description}</p>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  statusClass[mockTask.status]
                }`}
              >
                {mockTask.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  priorityClass[mockTask.priority]
                }`}
              >
                {mockTask.priority}
              </span>
              <span className="text-xs text-gray-400">
                📅{" "}
                {mockTask.due_date
                  ? new Date(mockTask.due_date).toLocaleDateString()
                  : "Không thời hạn"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {mockTask.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mb-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-blue-600 hover:underline"
              >
                {expanded ? "Ẩn" : "Hiển thị"} nhiệm vụ con (
                {mockTask.subtasks.length})
              </button>
              {expanded && (
                <ul className="mt-2 space-y-1">
                  {mockTask.subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="w-4 h-4"
                      />
                      <span
                        className={`text-sm ${
                          subtask.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {mockTask.started_at && (
                <span>
                  Started: {new Date(mockTask.started_at).toLocaleString()}
                </span>
              )}
              {mockTask.completed_at && (
                <span className="ml-4">
                  Completed: {new Date(mockTask.completed_at).toLocaleString()}
                </span>
              )}
              <span className="ml-4">
                Total Time: {Math.floor(mockTask.total_time / 60)}h{" "}
                {mockTask.total_time % 60}m
              </span>
            </div>
            {editingId === task.id && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                <input
                  value={localEditTask.title}
                  onChange={(e) =>
                    setLocalEditTask({
                      ...localEditTask,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded mb-2"
                />
                <select
                  value={localEditTask.status}
                  onChange={(e) =>
                    setLocalEditTask({
                      ...localEditTask,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-200 rounded mb-2"
                >
                  <option value="pending">Pending</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(task.id)}
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
              onClick={() => setViewingTask(task)}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
            >
              👁️
            </button>
            <button
              onClick={() => startEdit(task)}
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
            >
              🗑️
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
