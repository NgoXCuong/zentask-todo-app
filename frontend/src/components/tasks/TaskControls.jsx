import { useRef, useState, useEffect } from "react";
import { categoriesAPI, workspacesAPI } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, X } from "lucide-react";

export default function TaskControls({
  filter,
  setFilter,
  keyword,
  setKeyword,
  sortBy,
  setSortBy,
  order,
  setOrder,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  priority,
  setPriority,
  categoryId,
  setCategoryId,
  workspaceId,
  setWorkspaceId,
  setPage,
}) {
  const [categories, setCategories] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, ok } = await categoriesAPI.getAll();
      if (ok && data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    };

    const loadWorkspaces = async () => {
      const { data, ok } = await workspacesAPI.getUserWorkspaces();
      if (ok && data && Array.isArray(data.data)) {
        setWorkspaces(data.data);
      } else {
        setWorkspaces([]);
      }
    };

    loadCategories();
    loadWorkspaces();
  }, []);

  const handleSearch = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  return (
    <div className="space-y-4 mb-5">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm công việc..."
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-xs"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", "pending", "inprogress", "completed", "review"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === ""
                ? "Tất cả"
                : s === "pending"
                ? "Chờ"
                : s === "inprogress"
                ? "Đang làm"
                : s === "completed"
                ? "Xong"
                : "Xem xét"}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex gap-11 items-center bg-muted/50 p-2 rounded-xs overflow-x-auto">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Sắp xếp:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Ngày tạo</SelectItem>
              <SelectItem value="title">Tiêu đề</SelectItem>
              <SelectItem value="due_date">Hạn hoàn thành</SelectItem>
              <SelectItem value="priority">Độ ưu tiên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Từ ngày:</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Đến ngày:</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Ưu tiên:</Label>
          <Select
            value={priority || "all"}
            onValueChange={(value) => setPriority(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="urgent">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Danh mục:</Label>
          <Select
            value={categoryId || "all"}
            onValueChange={(value) =>
              setCategoryId(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Workspace:</Label>
          <Select
            value={workspaceId || "all"}
            onValueChange={(value) =>
              setWorkspaceId(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả workspace</SelectItem>
              <SelectItem value="personal">Task cá nhân</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(sortBy !== "created_at" ||
          order !== "DESC" ||
          startDate ||
          endDate ||
          priority ||
          categoryId ||
          workspaceId) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSortBy("created_at");
              setOrder("DESC");
              setStartDate("");
              setEndDate("");
              setPriority("");
              setCategoryId("");
              setWorkspaceId("");
              setPage(1);
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
