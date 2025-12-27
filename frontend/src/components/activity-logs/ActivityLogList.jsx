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
    { value: "UPLOAD_FILE", label: "Upload file" },
  ];

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => loadLogs()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Lịch sử hoạt động
            </h2>
          </div>

          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                showFilters: !prev.showFilters,
              }))
            }
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Context Info */}
        {(workspaceId || taskId) && (
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
            {workspaceId && (
              <span className="flex items-center space-x-1">
                <Building className="w-4 h-4" />
                <span>Workspace: {workspaceId}</span>
              </span>
            )}
            {taskId && (
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>Task: {taskId}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.create_task}
              </div>
              <div className="text-sm text-gray-600">Task tạo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.update_task}
              </div>
              <div className="text-sm text-gray-600">Task sửa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.assign_task}
              </div>
              <div className="text-sm text-gray-600">Task giao</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.complete_task}
              </div>
              <div className="text-sm text-gray-600">Task hoàn thành</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {filters.showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {actionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filters.action === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Logs List */}
      <div className="max-h-96 overflow-y-auto">
        {logs.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    "Tải thêm"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && logs.length === 0 && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang tải lịch sử hoạt động...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogList;
