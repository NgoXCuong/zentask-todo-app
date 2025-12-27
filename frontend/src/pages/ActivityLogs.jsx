import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ActivityLogList from "../components/activity-logs/ActivityLogList";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Activity, Filter, Building, FileText } from "lucide-react";
import { workspacesAPI } from "../services/api";

export default function ActivityLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [filters, setFilters] = useState({
    workspace_id: searchParams.get("workspace_id") || "",
    task_id: searchParams.get("task_id") || "",
    action: searchParams.get("action") || "",
  });

  const getDisplayValue = (key) => {
    if (key === "workspace_id") {
      return filters.workspace_id === "" ? "all" : filters.workspace_id;
    }
    return filters[key] || "";
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const result = await workspacesAPI.getUserWorkspaces();
      if (result.ok) {
        setWorkspaces(result.data.data || []);
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      workspace_id: "",
      task_id: "",
      action: "",
    });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lịch sử hoạt động
              </h1>
              <p className="text-gray-600">
                Theo dõi tất cả hoạt động trong hệ thống
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Xóa bộ lọc</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Workspace:</span>
            </div>
            <Select
              value={getDisplayValue("workspace_id")}
              onValueChange={(value) =>
                handleFilterChange("workspace_id", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả workspaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả workspaces</SelectItem>
                {workspaces.map((workspace) => (
                  <SelectItem
                    key={workspace.id}
                    value={workspace.id.toString()}
                  >
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Task ID:</span>
            </div>
            <input
              type="text"
              value={filters.task_id}
              onChange={(e) => handleFilterChange("task_id", e.target.value)}
              placeholder="Nhập Task ID"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            />

            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Hành động:</span>
            </div>
            <Select
              value={filters.action || "all"}
              onValueChange={(value) =>
                handleFilterChange("action", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hành động</SelectItem>
                <SelectItem value="CREATE_TASK">Tạo task</SelectItem>
                <SelectItem value="UPDATE_TASK">Cập nhật task</SelectItem>
                <SelectItem value="DELETE_TASK">Xóa task</SelectItem>
                <SelectItem value="ASSIGN_TASK">Giao task</SelectItem>
                <SelectItem value="COMPLETE_TASK">Hoàn thành task</SelectItem>
                <SelectItem value="ADD_COMMENT">Thêm bình luận</SelectItem>
                <SelectItem value="UPLOAD_FILE">Upload file</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity Log List */}
        <ActivityLogList
          workspaceId={filters.workspace_id}
          taskId={filters.task_id}
        />
      </div>
    </Layout>
  );
}
