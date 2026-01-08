import { Loader2, Inbox, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";

export default function WorkspaceTaskList({
  tasks,
  loading,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
}) {
  // Trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tải dữ liệu, vui lòng đợi...
        </p>
      </div>
    );
  }

  // Trạng thái danh sách trống
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/50">
        <div className="bg-card p-4 rounded-full shadow-sm mb-4">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground">
          Chưa có task nào
        </h3>
        <p className="text-muted-foreground max-w-[250px] text-center text-sm mt-1">
          Workspace này chưa có công việc nào.
        </p>
        <Button onClick={onAddTask} className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Task đầu tiên
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inprogress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "review":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ";
      case "inprogress":
        return "Đang làm";
      case "completed":
        return "Hoàn thành";
      case "review":
        return "Xem xét";
      case "canceled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "urgent":
        return "Khẩn cấp";
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {task.title}
                  </CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTask(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditTask(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getPriorityColor(task.priority)}
                >
                  {getPriorityLabel(task.priority)}
                </Badge>
                {task.due_date && (
                  <Badge variant="outline">
                    Hạn: {format(new Date(task.due_date), "dd/MM/yyyy")}
                  </Badge>
                )}
                {task.assignee && (
                  <Badge variant="outline">
                    Phụ trách: {task.assignee.full_name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>
                  Tạo: {format(new Date(task.created_at), "dd/MM/yyyy")}
                </span>
                {task.updated_at !== task.created_at && (
                  <span>
                    Cập nhật: {format(new Date(task.updated_at), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
