import { useState, useEffect } from "react";
import { tasksAPI } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import AttachmentList from "../attachments/AttachmentList";
import {
  MessageCircle,
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  User,
  Clock,
  Tag,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

export default function TaskDetailsModal({
  viewingTask,
  setViewingTask,
  startEdit,
  deleteTask,
}) {
  const [comments, setComments] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newSubTask, setNewSubTask] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editSubTaskText, setEditSubTaskText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewingTask) {
      loadComments();
      loadSubTasks();
    }
  }, [viewingTask]);

  const loadComments = async () => {
    if (!viewingTask) return;
    const { data, ok } = await tasksAPI.getComments(viewingTask.id);
    if (ok && data && Array.isArray(data.data)) {
      setComments(data.data);
    } else {
      setComments([]);
    }
  };

  const loadSubTasks = async () => {
    if (!viewingTask) return;
    const { data, ok } = await tasksAPI.getSubTasks(viewingTask.id);
    if (ok && data && Array.isArray(data.data)) {
      setSubTasks(data.data);
    } else {
      setSubTasks([]);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const { ok } = await tasksAPI.createComment(viewingTask.id, {
      content: newComment,
    });
    if (ok) {
      toast.success("Đã thêm bình luận!");
      setNewComment("");
      loadComments();
    } else {
      toast.error("Thêm bình luận thất bại!");
    }
    setLoading(false);
  };

  const updateComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    setLoading(true);
    const { ok } = await tasksAPI.updateComment(viewingTask.id, commentId, {
      content: editCommentText,
    });
    if (ok) {
      toast.success("Đã cập nhật bình luận!");
      setEditingComment(null);
      setEditCommentText("");
      loadComments();
    } else {
      toast.error("Cập nhật bình luận thất bại!");
    }
    setLoading(false);
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    setLoading(true);
    const { ok } = await tasksAPI.deleteComment(viewingTask.id, commentId);
    if (ok) {
      toast.success("Đã xóa bình luận!");
      loadComments();
    } else {
      toast.error("Xóa bình luận thất bại!");
    }
    setLoading(false);
  };

  const addSubTask = async () => {
    if (!newSubTask.trim()) return;
    setLoading(true);
    const { ok } = await tasksAPI.createSubTask(viewingTask.id, {
      title: newSubTask,
      is_done: false,
    });
    if (ok) {
      toast.success("Đã thêm nhiệm vụ con!");
      setNewSubTask("");
      loadSubTasks();
    } else {
      toast.error("Thêm nhiệm vụ con thất bại!");
    }
    setLoading(false);
  };

  const updateSubTask = async (subTaskId, updates) => {
    setLoading(true);
    const { ok } = await tasksAPI.updateSubTask(
      viewingTask.id,
      subTaskId,
      updates
    );
    if (ok) {
      toast.success("Đã cập nhật nhiệm vụ con!");
      loadSubTasks();
    } else {
      toast.error("Cập nhật nhiệm vụ con thất bại!");
    }
    setLoading(false);
  };

  const deleteSubTask = async (subTaskId) => {
    if (!confirm("Bạn chắc chắn muốn xóa nhiệm vụ con này?")) return;
    setLoading(true);
    const { ok } = await tasksAPI.deleteSubTask(viewingTask.id, subTaskId);
    if (ok) {
      toast.success("Đã xóa nhiệm vụ con!");
      loadSubTasks();
    } else {
      toast.error("Xóa nhiệm vụ con thất bại!");
    }
    setLoading(false);
  };

  if (!viewingTask) return null;

  const statusClass = {
    pending: "bg-chart-3/20 text-chart-3 border border-chart-3/30",
    inprogress: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
    completed: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
    review: "bg-chart-4/20 text-chart-4 border border-chart-4/30",
  };

  const statusTranslations = {
    pending: "Chưa giải quyết",
    inprogress: "Đang tiến hành",
    completed: "Đã hoàn thành",
    review: "Đang xem xét",
  };

  const priorityTranslations = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    urgent: "Khẩn cấp",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-100 pointer-events-none">
      <div className="bg-card rounded-xl shadow-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              Chi tiết Task
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewingTask(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Tiêu đề
                </Label>
                <p className="text-lg font-semibold text-card-foreground mt-1">
                  {viewingTask.title}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </Label>
                <p className="text-card-foreground whitespace-pre-wrap mt-1">
                  {viewingTask.description || "Không có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full bg-current"
                    style={{
                      color:
                        viewingTask.status === "completed"
                          ? "#10b981"
                          : viewingTask.status === "inprogress"
                          ? "#f59e0b"
                          : viewingTask.status === "pending"
                          ? "#6b7280"
                          : "#ef4444",
                    }}
                  ></div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </Label>
                    <p className="text-card-foreground mt-1">
                      {statusTranslations[viewingTask.status] ||
                        viewingTask.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Mức độ ưu tiên
                    </Label>
                    <p className="text-card-foreground mt-1">
                      {priorityTranslations[viewingTask.priority] ||
                        viewingTask.priority}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Hạn chót
                    </Label>
                    <p className="text-card-foreground mt-1">
                      {viewingTask.due_date
                        ? new Date(viewingTask.due_date).toLocaleDateString()
                        : "Không có hạn"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Danh mục
                    </Label>
                    <p className="text-card-foreground mt-1">
                      {viewingTask.category?.name || "Không có danh mục"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tạo
                    </Label>
                    <p className="text-card-foreground text-sm mt-1">
                      {new Date(viewingTask.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Sửa đổi lần cuối
                    </Label>
                    <p className="text-card-foreground text-sm mt-1">
                      {new Date(viewingTask.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tasks */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Nhiệm vụ con</h3>
              </div>

              <div className="space-y-2">
                {subTasks.map((subTask) => (
                  <div
                    key={subTask.id}
                    className="flex items-center gap-2 p-2 bg-accent/50 rounded"
                  >
                    <Checkbox
                      checked={subTask.is_done}
                      onCheckedChange={(checked) =>
                        updateSubTask(subTask.id, { is_done: checked })
                      }
                    />
                    {editingSubTask === subTask.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editSubTaskText}
                          onChange={(e) => setEditSubTaskText(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            updateSubTask(subTask.id, {
                              title: editSubTaskText,
                            });
                            setEditingSubTask(null);
                          }}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSubTask(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`flex-1 ${
                            subTask.is_done
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {subTask.title}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingSubTask(subTask.id);
                            setEditSubTaskText(subTask.title);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSubTask(subTask.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Thêm nhiệm vụ con..."
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubTask()}
                />
                <Button onClick={addSubTask} disabled={loading}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <AttachmentList
                taskId={viewingTask.id}
                canUpload={true}
                canDelete={true}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Bình luận</h3>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-accent/30 rounded-lg">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateComment(comment.id)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingComment(null)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-card-foreground">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditCommentText(comment.content);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Textarea
                placeholder="Thêm bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={addComment} disabled={loading}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <Button
              onClick={() => {
                setViewingTask(null);
                startEdit(viewingTask);
              }}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setViewingTask(null);
                deleteTask(viewingTask.id);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
            <Button variant="outline" onClick={() => setViewingTask(null)}>
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
