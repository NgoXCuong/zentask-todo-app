import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { notificationsAPI } from "../../services/api";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationsAPI.getUserNotifications({
        page: 1,
        limit: 10, // Limit for dropdown
      });

      if (result.ok) {
        setNotifications(result.data.data || []);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await notificationsAPI.getUnreadCount();
      if (result.ok) {
        const newCount = result.data.data.unread_count;
        setPreviousUnreadCount(unreadCount);
        setUnreadCount(newCount);

        // Show toast if new notifications arrived
        if (newCount > previousUnreadCount && previousUnreadCount > 0) {
          const newNotifications = newCount - previousUnreadCount;
          toast.info(`Bạn có ${newNotifications} thông báo mới!`, {
            duration: 4000,
          });
        }
      }
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Auto refresh unread count every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
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

  const handleViewAll = () => {
    navigate("/notifications");
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          className="relative p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
          title="Thông báo"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Thông báo
                </CardTitle>
                {unreadCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkAllAsRead}
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onInvitationAccepted={() => {
                      // Refresh notifications after invitation action
                      loadNotifications();
                      loadUnreadCount();
                    }}
                    compact={true}
                  />
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t text-center">
                <Link
                  to="/notifications"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
