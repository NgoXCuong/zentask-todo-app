import { useState, useEffect } from "react";
import { workspacesAPI } from "../services/api";
import { useLayout } from "../context/LayoutContext";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const { focusMode, setFocusMode } = useLayout();
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setLoading(true);
    const { data, ok } = await workspacesAPI.getUserWorkspaces();
    if (ok && data && Array.isArray(data.data)) {
      setWorkspaces(data.data);
    } else {
      setWorkspaces([]);
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

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(!focusMode)}
      />

      <div className={`flex-1 ${!focusMode ? "ml-64" : "ml-16"}`}>
        <Header focusMode={focusMode} setFocusMode={setFocusMode} user={user} />

        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quản lý Workspaces
              </h1>
              <p className="text-muted-foreground mt-1">
                Tạo và quản lý các nhóm làm việc của bạn
              </p>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
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
            <Dialog
              open={showAddMemberForm}
              onOpenChange={setShowAddMemberForm}
            >
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info(
                            "Tính năng cài đặt workspace sẽ có trong phiên bản tiếp theo!"
                          )
                        }
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {workspace.owner_id === user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWorkspace(workspace.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workspace.description || "Không có mô tả"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {workspace.WorkspaceMembers?.length || 0} thành viên
                      </span>
                    </div>

                    {workspace.WorkspaceMembers &&
                      workspace.WorkspaceMembers.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Thành viên:
                          </Label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {workspace.WorkspaceMembers.slice(0, 5).map(
                              (member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  {getRoleIcon(member.role)}
                                  <span>
                                    {member.User?.full_name || "Unknown"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({getRoleLabel(member.role)})
                                  </span>
                                </div>
                              )
                            )}
                            {workspace.WorkspaceMembers.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                và {workspace.WorkspaceMembers.length - 5} người
                                khác...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/tasks?workspace=${workspace.id}`)
                        }
                        className="flex-1"
                      >
                        Xem Tasks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddMemberDialog(workspace)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workspaces.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Chưa có workspace nào
              </h3>
              <p className="text-muted-foreground mb-4">
                Tạo workspace đầu tiên để bắt đầu làm việc nhóm
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Workspace
              </Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
