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
} from "lucide-react";

const ActivityLogItem = ({ log }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE_TASK":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "UPDATE_TASK":
        return <Edit className="w-4 h-4 text-blue-500" />;
      case "DELETE_TASK":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "ASSIGN_TASK":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "COMPLETE_TASK":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "ADD_COMMENT":
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case "UPLOAD_FILE":
        return <Paperclip className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
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
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="shrink-0 mt-0.5">{getActionIcon(log.action)}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {log.User?.full_name || "Người dùng"}
          </span>
          <span className="text-sm text-gray-600">
            đã {getActionText(log.action)}
          </span>
        </div>

        {log.description && (
          <p className="text-sm text-gray-700 mt-1">{log.description}</p>
        )}

        {log.entity_name && (log.old_value || log.new_value) && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <span className="font-medium text-gray-700">
              {log.entity_name}:
            </span>
            {log.old_value && (
              <span className="text-red-600 line-through ml-1">
                {log.old_value}
              </span>
            )}
            {log.old_value && log.new_value && <span className="mx-1">→</span>}
            {log.new_value && (
              <span className="text-green-600 font-medium">
                {log.new_value}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>{formatDate(log.created_at)}</span>

          {log.Workspace && (
            <span className="flex items-center space-x-1">
              <span>🏢</span>
              <span>{log.Workspace.name}</span>
            </span>
          )}

          {log.Task && (
            <span className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-32">{log.Task.title}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;
