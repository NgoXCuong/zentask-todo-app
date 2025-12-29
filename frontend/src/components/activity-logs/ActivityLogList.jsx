import { useState, useEffect } from "react";
import {
  Activity,
  Loader2,
  Filter,
  Calendar,
  Building,
  FileText,
} from "lucide-react";
import { activityLogsAPI } from "../../services/api";
import ActivityLogItem from "./ActivityLogItem";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const ActivityLogList = ({ workspaceId = "", taskId = "" }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    showFilters: false,
  });

  const loadLogs = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const result = await activityLogsAPI.getAll({
        page: pageNum,
        limit: 20,
        workspace_id: workspaceId,
        task_id: taskId,
        action: filters.action || "",
      });

      if (result.ok) {
        const newLogs = result.data.data || [];
        setLogs((prev) => (append ? [...prev, ...newLogs] : newLogs));
        setHasMore(newLogs.length === 20);
        setPage(pageNum);
      } else {
        setError(result.data?.message || "Không thể tải lịch sử hoạt động");
      }
    } catch (err) {
      setError("Lỗi kết nối mạng");
      console.error("Error loading activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await activityLogsAPI.getStats({
        workspace_id: workspaceId,
        task_id: taskId,
      });

      if (result.ok) {
        setStats(result.data.data);
      }
    } catch (err) {
      console.error("Error loading activity stats:", err);
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [workspaceId, taskId, filters.action]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadLogs(page + 1, true);
    }
  };

  const handleFilterChange = (action) => {
    setFilters((prev) => ({ ...prev, action }));
    setPage(1);
  };

  const actionOptions = [
    { value: "", label: "Tất cả hoạt động" },
    { value: "CREATE_TASK", label: "Tạo task" },
    { value: "UPDATE_TASK", label: "Cập nhật task" },
    { value: "DELETE_TASK", label: "Xóa task" },
    { value: "ASSIGN_TASK", label: "Giao task" },
    { value: "COMPLETE_TASK", label: "Hoàn thành task" },
    { value: "ADD_COMMENT", label: "Thêm bình luận" },
    { value: "CREATE_SUBTASK", label: "Thêm nhiệm vụ con" },
    { value: "UPLOAD_FILE", label: "Upload file" },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => loadLogs()} variant="destructive">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Lịch sử hoạt động
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                showFilters: !prev.showFilters,
              }))
            }
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Lọc
          </Button>
        </div>

        {/* Context Info */}
        {(workspaceId || taskId) && (
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {workspaceId && (
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                <span>Workspace: {workspaceId}</span>
              </span>
            )}
            {taskId && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Task: {taskId}</span>
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {/* Stats */}
      {stats && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.create_task}
              </div>
              <div className="text-sm text-muted-foreground">Task tạo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.update_task}
              </div>
              <div className="text-sm text-muted-foreground">Task sửa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.assign_task}
              </div>
              <div className="text-sm text-muted-foreground">Task giao</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.complete_task}
              </div>
              <div className="text-sm text-muted-foreground">
                Task hoàn thành
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {filters.showFilters && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
            {actionOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  filters.action === option.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <CardContent className="p-0">
        {/* Activity Logs List */}
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 && !loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            <>
              {logs.map((log) => (
                <ActivityLogItem key={log.id} log={log} />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="p-4 text-center border-t">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
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
          {loading && logs.length === 0 && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Đang tải lịch sử hoạt động...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLogList;
