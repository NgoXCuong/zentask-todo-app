import { useState } from "react";
import { tasksAPI } from "../../services/api";

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

  return (
    <div className="flex justify-between p-4 border border-gray-200 rounded-lg mb-3 hover:border-indigo-400 hover:shadow transition">
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{task.title}</h4>
        <p className="text-gray-500 text-sm mb-2">{task.description}</p>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              statusClass[task.status]
            }`}
          >
            {task.status}
          </span>
          <span className="text-xs text-gray-400">
            📅{" "}
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : "Không thời hạn"}
          </span>
        </div>
        {editingId === task.id && (
          <div className="mt-3 bg-gray-50 p-3 rounded-lg">
            <input
              value={localEditTask.title}
              onChange={(e) =>
                setLocalEditTask({ ...localEditTask, title: e.target.value })
              }
              className="w-full p-2 border border-gray-200 rounded mb-2"
            />
            <select
              value={localEditTask.status}
              onChange={(e) =>
                setLocalEditTask({ ...localEditTask, status: e.target.value })
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
  );
}
