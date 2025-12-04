import { useState } from "react";
import { tasksAPI } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Plus, Calendar, FileText, CheckSquare } from "lucide-react";

export default function AddTaskForm({
  showAddForm,
  setShowAddForm,
  loadData,
  showMsg,
}) {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
  });

  const createTask = async () => {
    if (!newTask.title.trim()) {
      showMsg("Vui lòng nhập tiêu đề!", true);
      return;
    }

    if (!newTask.description.trim()) {
      showMsg("Vui lòng nhập mô tả!", true);
      return;
    }

    if (newTask.title.length > 255) {
      showMsg("Tiêu đề quá dài!", true);
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

  if (!showAddForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl border border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">
              Thêm Task mới
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-accent rounded-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                placeholder="Nhập tiêu đề..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full p-3 bg-background border border-input rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Mô tả
              </label>
              <textarea
                placeholder="Nhập nội dung mô tả..."
                rows={3}
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full p-3 bg-background border border-input rounded-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full p-3 bg-background border border-input rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="pending">Chưa giải quyết</option>
                  <option value="inprogress">Đang tiến hành</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="w-full p-3 bg-background border border-input rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={createTask}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Tạo Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
