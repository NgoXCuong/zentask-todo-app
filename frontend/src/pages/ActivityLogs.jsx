import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ActivityLogList from "../components/activity-logs/ActivityLogList";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Activity, Filter, Building, FileText, X } from "lucide-react";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Lịch sử hoạt động
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Theo dõi tất cả hoạt động trong hệ thống
          </p>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2 self-start sm:self-center"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa bộ lọc</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building className="w-4 h-4" />
                Workspace
              </Label>
              <Select
                value={getDisplayValue("workspace_id")}
                onValueChange={(value) =>
                  handleFilterChange(
                    "workspace_id",
                    value === "all" ? "" : value
                  )
                }
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Task ID
              </Label>
              <Input
                type="text"
                value={filters.task_id}
                onChange={(e) => handleFilterChange("task_id", e.target.value)}
                placeholder="Nhập Task ID"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Hành động
              </Label>
              <Select
                value={filters.action || "all"}
                onValueChange={(value) =>
                  handleFilterChange("action", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Activity Log List */}
      <ActivityLogList
        workspaceId={filters.workspace_id}
        taskId={filters.task_id}
      />
    </Layout>
  );
}
