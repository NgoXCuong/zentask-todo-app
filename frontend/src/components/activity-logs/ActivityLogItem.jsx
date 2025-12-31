import {
  User,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
  Paperclip,
  Edit,
  Trash2,
  CheckSquare,
} from "lucide-react";

const ActivityLogItem = ({ log }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE_TASK":
        return (
          <FileText className="w-5 h-5 text-green-500 dark:text-green-400" />
        );
      case "UPDATE_TASK":
        return <Edit className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case "DELETE_TASK":
        return <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case "ASSIGN_TASK":
        return (
          <UserPlus className="w-5 h-5 text-purple-500 dark:text-purple-400" />
        );
      case "COMPLETE_TASK":
        return (
          <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        );
      case "ADD_COMMENT":
        return (
          <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        );
      case "CREATE_SUBTASK":
        return (
          <CheckSquare className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
        );
      case "UPLOAD_FILE":
        return (
          <Paperclip className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        );
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case "CREATE_TASK":
        return "tạo task";
      case "UPDATE_TASK":
        return "cập nhật task";
      case "DELETE_TASK":
        return "xóa task";
      case "ASSIGN_TASK":
        return "giao task";
      case "COMPLETE_TASK":
        return "hoàn thành task";
      case "ADD_COMMENT":
        return "thêm bình luận";
      case "CREATE_SUBTASK":
        return "thêm nhiệm vụ con";
      case "UPLOAD_FILE":
        return "upload file";
      default:
        return action.toLowerCase().replace("_", " ");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-accent/50 rounded-xs transition-colors border-b border-border/50 last:border-b-0">
      <div className="shrink-0 mt-1 p-2 bg-accent/30 rounded-full">
        {getActionIcon(log.action)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-semibold text-foreground">
            {log.User?.full_name || "Người dùng"}
          </span>
          <span className="text-sm text-muted-foreground">
            đã {getActionText(log.action)}
          </span>
        </div>

        {log.description && (
          <p className="text-sm text-card-foreground mt-2 leading-relaxed">
            {log.description}
          </p>
        )}

        {log.entity_name && (log.old_value || log.new_value) && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border/50 text-xs">
            <span className="font-medium text-foreground">
              {log.entity_name}:
            </span>
            {log.old_value && (
              <span className="text-destructive line-through ml-2">
                {log.old_value}
              </span>
            )}
            {log.old_value && log.new_value && (
              <span className="mx-2 text-muted-foreground">→</span>
            )}
            {log.new_value && (
              <span className="text-green-600 dark:text-green-400 font-medium ml-1">
                {log.new_value}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <span>🕒</span>
              <span>{formatDate(log.created_at)}</span>
            </span>

            {log.Workspace && (
              <span className="flex items-center space-x-1 px-2 py-1 bg-accent/30 rounded-full self-start">
                <span>🏢</span>
                <span className="font-medium">{log.Workspace.name}</span>
              </span>
            )}
          </div>

          {log.Task && (
            <span className="flex items-center space-x-2 text-xs text-muted-foreground px-2 py-1 bg-accent/30 rounded-full max-w-48 self-start sm:self-center">
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate font-medium">{log.Task.title}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;
