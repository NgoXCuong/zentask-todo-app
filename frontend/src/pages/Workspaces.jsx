import React, { useState, useEffect } from "react";
import { workspacesAPI, tasksAPI } from "../services/api";
import { useLayout } from "../context/LayoutContext";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Users,
  Settings,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  User,
  Eye,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import AddTaskForm from "../components/tasks/AddTaskForm";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
  });
  const [newMember, setNewMember] = useState({
    email: "",
    role: "member",
  });
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [tasksWorkspace, setTasksWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState({ title: "", status: "" });
  const [viewingTask, setViewingTask] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6; // Show 6 workspaces per page
  const { user } = useAuth();
  const { focusMode, setFocusMode } = useLayout();
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, [page]);

  const loadWorkspaces = async () => {
    setLoading(true);
    const { data, ok } = await workspacesAPI.getUserWorkspaces({ page, limit });
    if (ok && data && Array.isArray(data.data)) {
      setWorkspaces(data.data);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } else {
      setWorkspaces([]);
      setTotal(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error("Vui lòng nhập tên workspace!");
      return;
    }

    setLoading(true);
    const { ok } = await workspacesAPI.create(newWorkspace);
    if (ok) {
      toast.success("Đã tạo workspace thành công!");
      setNewWorkspace({ name: "", description: "" });
      setShowCreateForm(false);
      loadWorkspaces();
    } else {
      toast.error("Tạo workspace thất bại!");
    }
    setLoading(false);
  };

  const deleteWorkspace = async (workspaceId) => {
    if (!confirm("Bạn chắc chắn muốn xóa workspace này?")) return;

    const { ok } = await workspacesAPI.delete(workspaceId);
    if (ok) {
      toast.success("Đã xóa workspace!");
      loadWorkspaces();
    } else {
      toast.error("Xóa workspace thất bại!");
    }
  };

  const addMember = async () => {
    if (!newMember.email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    if (!selectedWorkspace) {
      toast.error("Không tìm thấy workspace!");
      return;
    }

    setLoading(true);
    const { ok } = await workspacesAPI.addMember(
      selectedWorkspace.id,
      newMember
    );
    if (ok) {
      toast.success("Đã thêm thành viên thành công!");
      setNewMember({ email: "", role: "member" });
      setSelectedWorkspace(null);
      setShowAddMemberForm(false);
      loadWorkspaces();
    } else {
      toast.error("Thêm thành viên thất bại!");
    }
    setLoading(false);
  };

  const openAddMemberDialog = (workspace) => {
    setSelectedWorkspace(workspace);
    setNewMember({ email: "", role: "member" });
    setShowAddMemberForm(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "member":
        return <User className="w-4 h-4 text-green-500" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "owner":
        return "Chủ sở hữu";
      case "admin":
        return "Quản trị viên";
      case "member":
        return "Thành viên";
      case "viewer":
        return "Người xem";
      default:
        return "Thành viên";
    }
  };

  const openTasksModal = (workspace) => {
    setTasksWorkspace(workspace);
    setShowTasksModal(true);
    loadTasks(workspace.id);
  };

  const loadTasks = async (workspaceId) => {
    setTasksLoading(true);
    try {
      const tasksRes = await tasksAPI.getAll({
        page,
        limit,
        status: filter,
        keyword,
        sort_by: sortBy,
        order,
        start_date: startDate,
        end_date: endDate,
        priority,
        category_id: categoryId,
        workspace_id: workspaceId,
      });

      if (tasksRes.ok) {
        setTasks(tasksRes.data.data || []);
        setTotalPages(tasksRes.data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (tasksWorkspace) {
      loadTasks(tasksWorkspace.id);
    }
  }, [
    page,
    filter,
    keyword,
    sortBy,
    order,
    startDate,
    endDate,
    priority,
    categoryId,
  ]);

  const showMsg = (text, isError = false) => {
    if (isError) {
      toast.error(text);
    } else {
      toast.success(text);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    const { ok } = await tasksAPI.delete(id);
    if (ok) {
      showMsg("Đã xóa!");
      if (tasksWorkspace) {
        loadTasks(tasksWorkspace.id);
      }
    } else {
      showMsg("Xóa thất bại!", true);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTask({ title: task.title, status: task.status });
  };

  const leaveWorkspace = async (workspaceId) => {
    if (!confirm("Bạn chắc chắn muốn rời khỏi workspace này?")) return;

    setLoading(true);
    const { ok } = await workspacesAPI.leaveWorkspace(workspaceId);
    if (ok) {
      toast.success("Đã rời khỏi workspace!");
      loadWorkspaces();
    } else {
      toast.error("Rời khỏi workspace thất bại!");
    }
    setLoading(false);
  };

  const removeMember = async (workspaceId, memberId, memberName) => {
    if (!confirm(`Bạn chắc chắn muốn xóa ${memberName} khỏi workspace này?`))
      return;

    setLoading(true);
    const { ok } = await workspacesAPI.removeMember(workspaceId, memberId);
    if (ok) {
      toast.success(`Đã xóa ${memberName} khỏi workspace!`);
      loadWorkspaces();
    } else {
      toast.error("Xóa thành viên thất bại!");
    }
    setLoading(false);
  };

  const isUserOwnerOrAdmin = (workspace) => {
    if (workspace.owner_id === user?.id) return true;

    const userMember = workspace.WorkspaceMembers?.find(
      (member) => member.user_id === user?.id && member.status === "active"
    );

    return (
      userMember && (userMember.role === "admin" || userMember.role === "owner")
    );
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Quản lý Workspaces
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Tạo và quản lý các nhóm làm việc của bạn
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="self-start sm:self-center">
              <Plus className="w-4 h-4 mr-2" />
              Tạo Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Workspace mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Tên Workspace
                </Label>
                <Input
                  placeholder="Nhập tên workspace..."
                  value={newWorkspace.name}
                  onChange={(e) =>
                    setNewWorkspace({
                      ...newWorkspace,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Mô tả (tùy chọn)
                </Label>
                <Textarea
                  placeholder="Mô tả về workspace này..."
                  rows={3}
                  value={newWorkspace.description}
                  onChange={(e) =>
                    setNewWorkspace({
                      ...newWorkspace,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button onClick={createWorkspace} className="flex-1">
                  Tạo Workspace
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={showAddMemberForm} onOpenChange={setShowAddMemberForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Thêm thành viên vào {selectedWorkspace?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Email người dùng
                </Label>
                <Input
                  type="email"
                  placeholder="Nhập email của người dùng..."
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Vai trò
                </Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Thành viên</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="viewer">Người xem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMemberForm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button onClick={addMember} className="flex-1">
                  Thêm thành viên
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tasks Modal */}
        <Dialog open={showTasksModal} onOpenChange={setShowTasksModal}>
          <DialogContent className="w-[95vw] sm:w-[85vw] lg:w-1/2 max-w-none h-[80vh] sm:h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Tasks trong {tasksWorkspace?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TaskList
                tasks={tasks}
                loading={tasksLoading}
                editingId={editingId}
                setEditingId={setEditingId}
                editTask={editTask}
                setEditTask={setEditTask}
                loadData={() => tasksWorkspace && loadTasks(tasksWorkspace.id)}
                showMsg={showMsg}
                setViewingTask={setViewingTask}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl wrap-break-word">
                    {workspace.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workspace.description || "Không có mô tả"}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-start">
                  {workspace.owner_id === user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWorkspace(workspace.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>
                    {workspace.WorkspaceMembers?.filter(
                      (member) => member.status === "active"
                    ).length || 0}{" "}
                    thành viên
                  </span>
                </div>

                {workspace.WorkspaceMembers &&
                  workspace.WorkspaceMembers.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Thành viên:</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {workspace.WorkspaceMembers.filter(
                          (member) => member.status === "active"
                        )
                          .slice(0, 3) // Show fewer on mobile
                          .map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              {getRoleIcon(member.role)}
                              <span className="truncate flex-1">
                                {member.User?.full_name || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                ({getRoleLabel(member.role)})
                              </span>
                              {isUserOwnerOrAdmin(workspace) &&
                                member.role !== "owner" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeMember(
                                        workspace.id,
                                        member.user_id || member.User?.id,
                                        member.User?.full_name || "Unknown"
                                      )
                                    }
                                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                                    title={`Xóa ${
                                      member.User?.full_name || "Unknown"
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                            </div>
                          ))}
                        {workspace.WorkspaceMembers.filter(
                          (member) => member.status === "active"
                        ).length > 3 && (
                          <div
                            key="more-members"
                            className="text-xs text-muted-foreground"
                          >
                            và{" "}
                            {workspace.WorkspaceMembers.filter(
                              (member) => member.status === "active"
                            ).length - 3}{" "}
                            người khác...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTasksModal(workspace)}
                    className="flex-1"
                  >
                    Xem Tasks
                  </Button>
                  {workspace.owner_id === user?.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddMemberDialog(workspace)}
                      className="shrink-0"
                    >
                      <UserPlus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Thêm</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => leaveWorkspace(workspace.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    >
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Rời</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page numbers - simplified for mobile */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // On mobile, show fewer pages
                    const isMobile = window.innerWidth < 640;
                    if (isMobile) {
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        pageNum === page
                      );
                    }
                    // On larger screens, show more pages
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    );
                  })
                  .map((pageNum, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    if (prevPage && pageNum - prevPage > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${pageNum}`}>
                          <PaginationItem>
                            <span className="px-2 py-2 text-sm">...</span>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer h-9 w-9 p-0"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer h-9 w-9 p-0"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setPage(page + 1)}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {workspaces.length === 0 && !loading && total === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có workspace nào</h3>
          <p className="text-muted-foreground mb-4">
            Tạo workspace đầu tiên để bắt đầu làm việc nhóm
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Workspace
          </Button>
        </Card>
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        viewingTask={viewingTask}
        setViewingTask={setViewingTask}
        startEdit={startEdit}
        deleteTask={deleteTask}
      />

      {/* Add Task Form Modal */}
      <AddTaskForm
        showAddForm={showAddTaskForm}
        setShowAddForm={setShowAddTaskForm}
        loadData={() => tasksWorkspace && loadTasks(tasksWorkspace.id)}
        showMsg={showMsg}
      />
    </Layout>
  );
}
