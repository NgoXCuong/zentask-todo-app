import { useState, useEffect } from "react";
import { tasksAPI, categoriesAPI, workspacesAPI } from "../../services/api";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  X,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

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
    priority: "medium",
    due_date: "",
    start_date: "",
    reminder_at: "",
    category_id: "",
    workspace_id: "",
  });

  // Helper to format ISO date to datetime-local format
  const formatForDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const [categories, setCategories] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, ok } = await categoriesAPI.getAll();
      if (ok && data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    };

    const loadWorkspaces = async () => {
      const { data, ok } = await workspacesAPI.getUserWorkspaces();
      if (ok && data && Array.isArray(data.data)) {
        setWorkspaces(data.data);
      } else {
        setWorkspaces([]);
      }
    };

    if (showAddForm) {
      loadCategories();
      loadWorkspaces();
    }
  }, [showAddForm]);

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề!");
      return;
    }

    if (newTask.title.length > 255) {
      toast.error("Tiêu đề quá dài!");
      return;
    }

    if (newTask.description && newTask.description.length > 1000) {
      toast.error("Mô tả quá dài!");
      return;
    }

    // Prepare task data for API
    const taskData = {
      ...newTask,
      category_id:
        newTask.category_id === "none" ? null : newTask.category_id || null,
      workspace_id:
        newTask.workspace_id === "none" ? null : newTask.workspace_id || null,
    };

    const { ok } = await tasksAPI.create(taskData);
    if (ok) {
      toast.success("Đã tạo task thành công!");
      setShowAddForm(false);
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
        start_date: "",
        reminder_at: "",
        category_id: "",
        workspace_id: "",
      });
      loadData();
    } else {
      toast.error("Tạo task thất bại!");
    }
  };

  if (!showAddForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-sm shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">
              Thêm Task mới
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                Tiêu đề
              </Label>
              <Input
                type="text"
                placeholder="Nhập tiêu đề..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                Mô tả
              </Label>
              <Textarea
                placeholder="Nhập nội dung mô tả..."
                rows={3}
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Trạng thái
                </Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chưa giải quyết</SelectItem>
                    <SelectItem value="inprogress">Đang tiến hành</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="review">Đang xem xét</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Mức độ ưu tiên
                </Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Ngày bắt đầu
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {newTask.start_date
                        ? format(new Date(newTask.start_date), "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newTask.start_date
                          ? new Date(newTask.start_date)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Format as YYYY-MM-DD to avoid timezone issues
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          const dateString = `${year}-${month}-${day}`;
                          setNewTask({
                            ...newTask,
                            start_date: dateString,
                          });
                        } else {
                          setNewTask({
                            ...newTask,
                            start_date: "",
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Ngày hết hạn
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {newTask.due_date
                        ? format(new Date(newTask.due_date), "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newTask.due_date
                          ? new Date(newTask.due_date)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Format as YYYY-MM-DD to avoid timezone issues
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          const dateString = `${year}-${month}-${day}`;
                          setNewTask({
                            ...newTask,
                            due_date: dateString,
                          });
                        } else {
                          setNewTask({
                            ...newTask,
                            due_date: "",
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Nhắc nhở lúc
                </Label>
                <Input
                  type="datetime-local"
                  value={formatForDateTimeLocal(newTask.reminder_at)}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Convert to ISO format for API
                    const isoValue = value ? new Date(value).toISOString() : "";
                    setNewTask({ ...newTask, reminder_at: isoValue });
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Danh mục
                </Label>
                <Select
                  value={newTask.category_id}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, category_id: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">
                Workspace
              </Label>
              <Select
                value={newTask.workspace_id}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, workspace_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn workspace (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Task cá nhân</SelectItem>
                  {workspaces.map((workspace) => (
                    <SelectItem
                      key={workspace.id}
                      value={workspace.id.toString()}
                    >
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowAddForm(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button onClick={createTask} className="flex-1">
              Tạo Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
