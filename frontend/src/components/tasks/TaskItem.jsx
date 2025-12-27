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
import { toast } from "sonner";

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
  const [subTasks, setSubTasks] = useState([]);
  const [loadingSubTasks, setLoadingSubTasks] = useState(false);

  const loadSubTasks = async () => {
    if (subTasks.length > 0) return; // Already loaded
    setLoadingSubTasks(true);
    const { data, ok } = await tasksAPI.getSubTasks(task.id);
    if (ok && data && Array.isArray(data.data)) {
      setSubTasks(data.data);
    } else {
      setSubTasks([]);
    }
    setLoadingSubTasks(false);
  };

  const toggleExpanded = async () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && subTasks.length === 0) {
      await loadSubTasks();
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    const { ok } = await tasksAPI.delete(id);
    if (ok) {
      toast.success("Đã xóa task thành công!");
      loadData();
    } else {
      toast.error("Xóa task thất bại!");
    }
  };

  const saveEdit = async (id) => {
    const { ok } = await tasksAPI.update(id, localEditTask);
    if (ok) {
      toast.success("Đã cập nhật task thành công!");
      setEditingId(null);
      loadData();
    } else {
      toast.error("Cập nhật task thất bại!");
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
    review: "bg-purple-100 text-purple-800",
    canceled: "bg-red-100 text-red-800",
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
    canceled: "Đã hủy",
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
                <CalendarIcon size={12} /> Hạn:
                {task.due_date
                  ? format(new Date(task.due_date), "dd/MM/yyyy")
                  : "Không thời hạn"}
              </span>
              <span>-</span>
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

            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1 p-1 h-auto"
                disabled={loadingSubTasks}
              >
                <CheckSquare size={14} />
                {loadingSubTasks
                  ? "Đang tải..."
                  : expanded
                  ? "Ẩn"
                  : "Hiển thị"}{" "}
                nhiệm vụ con
                {task.subTasks && task.subTasks.length > 0 && (
                  <span> ({task.subTasks.length})</span>
                )}
              </Button>
              {expanded && subTasks.length > 0 && (
                <ul className="mt-2 space-y-1 ml-4">
                  {subTasks.map((subtask) => (
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
                        <SelectItem value="canceled">Đã hủy</SelectItem>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingTask(task)}
              className="p-2 h-8 w-8"
              title="Xem chi tiết"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEdit(task)}
              className="p-2 h-8 w-8"
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="p-2 h-8 w-8 text-destructive hover:text-destructive"
              title="Xóa"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
