import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell,
  Check,
  X,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { notificationsAPI, workspacesAPI } from "../../services/api";

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onInvitationAccepted,
  compact = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  const handleMarkAsRead = async () => {
    if (notification.is_read) return;

    setIsLoading(true);
    try {
      const result = await notificationsAPI.markAsRead(notification.id);
      if (result.ok) {
        onMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await notificationsAPI.delete(notification.id);
      if (result.ok) {
        onDelete(notification.id);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!notification.reference_id) return;

    setIsActionLoading(true);
    try {
      const result = await workspacesAPI.acceptInvitation(
        notification.reference_id
      );
      if (result.ok) {
        // Mark as read and remove from list
        if (!notification.is_read) {
          await notificationsAPI.markAsRead(notification.id);
        }
        onDelete(notification.id);
        // Call callback to refresh workspace data
        if (onInvitationAccepted) {
          onInvitationAccepted(notification.reference_id);
        }

        // Show success message and redirect to dashboard to refresh workspace data
        toast.success("Đã chấp nhận lời mời tham gia workspace!");
        navigate("/");
      } else {
        toast.error("Không thể chấp nhận lời mời. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Lỗi khi chấp nhận lời mời.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!notification.reference_id) return;

    setIsActionLoading(true);
    try {
      const result = await workspacesAPI.declineInvitation(
        notification.reference_id
      );
      if (result.ok) {
        // Mark as read and remove from list
        if (!notification.is_read) {
          await notificationsAPI.markAsRead(notification.id);
        }
        onDelete(notification.id);
        toast.success("Đã từ chối lời mời tham gia workspace!");
      } else {
        toast.error("Không thể từ chối lời mời. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Lỗi khi từ chối lời mời.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "workspace_invite":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "task_assigned":
        return <User className="w-5 h-5 text-green-500" />;
      case "task_deadline":
        return <Calendar className="w-5 h-5 text-red-500" />;
      case "new_comment":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "task_completed":
        return <Check className="w-5 h-5 text-emerald-500" />;
      case "task_created":
        return <FileText className="w-5 h-5 text-indigo-500" />;
      case "task_updated":
        return <FileText className="w-5 h-5 text-orange-500" />;
      case "task_overdue":
        return <Calendar className="w-5 h-5 text-red-600" />;
      case "comment_updated":
        return <MessageSquare className="w-5 h-5 text-pink-500" />;
      case "subtask_completed":
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case "mention":
        return <User className="w-5 h-5 text-cyan-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
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

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div
      className={`${
        compact ? "p-3" : "p-4"
      } border-b border-border hover:bg-accent transition-colors ${
        !notification.is_read ? "bg-accent/50 border-l-4 border-l-primary" : ""
      }`}
    >
      <div
        className={`flex items-start space-x-3 ${compact ? "space-x-2" : ""}`}
      >
        <div className="shrink-0">{getNotificationIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <p
            className={`${compact ? "text-xs" : "text-sm"} leading-tight ${
              !notification.is_read ? "font-medium" : "text-muted-foreground"
            }`}
          >
            {compact && notification.message.length > 80
              ? `${notification.message.substring(0, 80)}...`
              : notification.message}
          </p>

          {notification.sender && !compact && (
            <p className="text-xs text-muted-foreground mt-1">
              Từ: {notification.sender.full_name}
            </p>
          )}

          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDate(notification.created_at)}
          </p>
        </div>

        <div
          className={`flex items-center ${compact ? "space-x-1" : "space-x-2"}`}
        >
          {/* Accept/Decline buttons only for actual invitations */}
          {notification.type === "workspace_invite" &&
            !notification.is_read &&
            notification.message.includes("Bạn đã được mời") &&
            !compact && (
              <>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isActionLoading}
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  title="Chấp nhận lời mời"
                >
                  {isActionLoading ? "..." : "OK"}
                </Button>
                <Button
                  onClick={handleDeclineInvitation}
                  disabled={isActionLoading}
                  size="sm"
                  variant="destructive"
                  title="Từ chối lời mời"
                >
                  {isActionLoading ? "..." : "✕"}
                </Button>
              </>
            )}

          {!notification.is_read &&
            notification.type !== "workspace_invite" && (
              <Button
                onClick={handleMarkAsRead}
                disabled={isLoading}
                size={compact ? "sm" : "default"}
                variant="ghost"
                className="text-primary hover:bg-accent"
                title="Đánh dấu đã đọc"
              >
                <Check className={`${compact ? "w-3 h-3" : "w-4 h-4"}`} />
              </Button>
            )}

          <Button
            onClick={handleDelete}
            disabled={isLoading}
            size={compact ? "sm" : "default"}
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            title="Xóa thông báo"
          >
            <X className={`${compact ? "w-3 h-3" : "w-4 h-4"}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
