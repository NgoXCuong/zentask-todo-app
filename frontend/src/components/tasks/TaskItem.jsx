import { useState } from "react";
import { tasksAPI } from "../../services/api";
import { Card, CardContent } from "../ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Calendar as CalendarIcon,
  Tag,
  User,
  MessageCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

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
    setLocalEditTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      start_date: task.start_date,
      reminder_at: task.reminder_at,
      category_id: task.category_id,
      assignee_id: task.assignee_id,
    });
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
    urgent: "bg-red-200 text-red-900",
  };

  const statusLabels = {
    pending: "Chưa giải quyết",
    inprogress: "Đang tiến hành",
    completed: "Đã hoàn thành",
    review: "Đang xem xét",
  };

  const priorityLabels = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    urgent: "Khẩn cấp",
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{task.title}</h4>
              {task.creator && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User size={12} />
                  {task.creator.full_name}
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusClass[task.status]
                }`}
              >
                {statusLabels[task.status]}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  priorityClass[task.priority]
                }`}
              >
                {priorityLabels[task.priority]}
              </span>
              {task.category && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                  <Tag size={10} />
                  {task.category.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} />
                {task.due_date
                  ? format(new Date(task.due_date), "dd/MM/yyyy")
                  : "Không thời hạn"}
              </span>
              {task.start_date && (
                <span>
                  Bắt đầu: {format(new Date(task.start_date), "dd/MM/yyyy")}
                </span>
              )}
              {task.completed_at && (
                <span>
                  Hoàn thành:{" "}
                  {format(new Date(task.completed_at), "dd/MM/yyyy")}
                </span>
              )}
              {task.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  {task.comments_count} bình luận
                </span>
              )}
            </div>

            {task.sub_tasks && task.sub_tasks.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <CheckSquare size={14} />
                  {expanded ? "Ẩn" : "Hiển thị"} nhiệm vụ con (
                  {task.sub_tasks.length})
                </button>
                {expanded && (
                  <ul className="mt-2 space-y-1 ml-4">
                    {task.sub_tasks.map((subtask) => (
                      <li key={subtask.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subtask.is_done}
                          readOnly
                          className="w-3 h-3"
                        />
                        <span
                          className={`text-sm ${
                            subtask.is_done ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {task.assignee && task.creator.id !== task.assignee.id && (
              <div className="text-xs text-gray-500 mb-2">
                Phân công cho: {task.assignee.full_name}
              </div>
            )}
            {editingId === task.id && (
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Tiêu đề
                    </Label>
                    <Input
                      value={localEditTask.title || ""}
                      onChange={(e) =>
                        setLocalEditTask({
                          ...localEditTask,
                          title: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Trạng thái
                    </Label>
                    <Select
                      value={localEditTask.status || task.status}
                      onValueChange={(value) =>
                        setLocalEditTask({
                          ...localEditTask,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chưa giải quyết</SelectItem>
                        <SelectItem value="inprogress">
                          Đang tiến hành
                        </SelectItem>
                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        <SelectItem value="review">Đang xem xét</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Mức độ ưu tiên
                    </Label>
                    <Select
                      value={localEditTask.priority || task.priority}
                      onValueChange={(value) =>
                        setLocalEditTask({
                          ...localEditTask,
                          priority: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Ngày hết hạn
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localEditTask.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localEditTask.due_date
                            ? format(
                                new Date(localEditTask.due_date),
                                "dd/MM/yyyy"
                              )
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            localEditTask.due_date
                              ? new Date(localEditTask.due_date)
                              : undefined
                          }
                          onSelect={(date) =>
                            setLocalEditTask({
                              ...localEditTask,
                              due_date: date
                                ? date.toISOString().split("T")[0]
                                : "",
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="block text-sm font-medium mb-2">
                    Mô tả
                  </Label>
                  <Textarea
                    value={localEditTask.description || ""}
                    onChange={(e) =>
                      setLocalEditTask({
                        ...localEditTask,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveEdit(task.id)} size="sm">
                    Lưu
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    size="sm"
                  >
                    Hủy
                  </Button>
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
