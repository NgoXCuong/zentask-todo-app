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
    priority: "medium",
    tags: "",
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
        priority: "medium",
        tags: "",
      });
      loadData();
    } else {
      showMsg("Thêm thất bại!", true);
    }
  };

  if (!showAddForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-sm shadow-xl border border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                      onSelect={(date) =>
                        setNewTask({
                          ...newTask,
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

              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-2">
                  Thẻ (tags)
                </Label>
                <Input
                  type="text"
                  placeholder="Nhập thẻ, cách nhau bằng dấu phẩy"
                  value={newTask.tags}
                  onChange={(e) =>
                    setNewTask({ ...newTask, tags: e.target.value })
                  }
                  className="w-full"
                />
              </div>
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
