import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { notificationsAPI } from "../../services/api";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ onInvitationAccepted }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const result = await notificationsAPI.getUserNotifications({
        page: pageNum,
        limit: 20,
      });

      if (result.ok) {
        const newNotifications = result.data.data || [];
        setNotifications((prev) =>
          append ? [...prev, ...newNotifications] : newNotifications
        );
        setHasMore(newNotifications.length === 20);
        setPage(pageNum);
      } else {
        setError(result.data?.message || "Không thể tải thông báo");
      }
    } catch (err) {
      setError("Lỗi kết nối mạng");
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await notificationsAPI.getUnreadCount();
      if (result.ok) {
        setUnreadCount(result.data.data.unread_count);
      }
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleDelete = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    // Update unread count if deleted notification was unread
    const deletedNotification = notifications.find(
      (n) => n.id === notificationId
    );
    if (deletedNotification && !deletedNotification.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationsAPI.markAllAsRead();
      if (result.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-4 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => loadNotifications()} variant="destructive">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Thông báo</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-accent"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Notifications List */}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && !loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onInvitationAccepted={onInvitationAccepted}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="p-4 text-center border-t">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="ghost"
                    className="text-primary hover:bg-accent"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Tải thêm"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Loading State */}
          {loading && notifications.length === 0 && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Đang tải thông báo...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
