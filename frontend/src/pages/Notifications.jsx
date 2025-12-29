import { useState } from "react";
import { toast } from "sonner";
import Layout from "../components/layout/Layout";
import NotificationList from "../components/notifications/NotificationList";
import { Button } from "../components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { notificationsAPI } from "../services/api";

export default function Notifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const result = await notificationsAPI.markAllAsRead();
      if (result.ok) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleInvitationAccepted = (workspaceId) => {
    // Show success message
    toast.success(
      "Bạn đã được thêm vào workspace! Workspace sẽ xuất hiện trong danh sách của bạn."
    );

    // In a real app, this would trigger a global state update or refresh
    // For now, we'll just show the message since workspace data refresh
    // would require more complex state management across the app
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
              <p className="text-muted-foreground">
                Quản lý tất cả thông báo của bạn
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <BellRing className="w-4 h-4" />
              <span>Đánh dấu tất cả đã đọc</span>
            </Button>
          )}
        </div>

        {/* Notification List */}
        <NotificationList onInvitationAccepted={handleInvitationAccepted} />
      </div>
    </Layout>
  );
}
