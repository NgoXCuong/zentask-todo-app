import { useState, useEffect } from "react";
import { tasksAPI } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  MessageCircle,
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
} from "lucide-react";

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
      setNewComment("");
      loadComments();
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
      setEditingComment(null);
      setEditCommentText("");
      loadComments();
    }
    setLoading(false);
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    setLoading(true);
    const { ok } = await tasksAPI.deleteComment(viewingTask.id, commentId);
    if (ok) {
      loadComments();
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
      setNewSubTask("");
      loadSubTasks();
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
      loadSubTasks();
    }
    setLoading(false);
  };

  const deleteSubTask = async (subTaskId) => {
    if (!confirm("Bạn chắc chắn muốn xóa nhiệm vụ con này?")) return;
    setLoading(true);
    const { ok } = await tasksAPI.deleteSubTask(viewingTask.id, subTaskId);
    if (ok) {
      loadSubTasks();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              Chi tiết Task
            </h2>
            <button
              onClick={() => setViewingTask(null)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tiêu đề
                </label>
                <p className="text-lg font-semibold text-card-foreground">
                  {viewingTask.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Mô tả
                </label>
                <p className="text-card-foreground whitespace-pre-wrap">
                  {viewingTask.description || "Không có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Trạng thái
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      statusClass[viewingTask.status]
                    }`}
                  >
                    {viewingTask.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Mức độ ưu tiên
                  </label>
                  <span className="text-card-foreground capitalize">
                    {viewingTask.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Hạn chót
                  </label>
                  <p className="text-card-foreground">
                    {viewingTask.due_date
                      ? new Date(viewingTask.due_date).toLocaleDateString()
                      : "Không có hạn"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Danh mục
                  </label>
                  <p className="text-card-foreground">
                    {viewingTask.category?.name || "Không có danh mục"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Tạo
                  </label>
                  <p className="text-card-foreground">
                    {new Date(viewingTask.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Sửa đổi lần cuối
                  </label>
                  <p className="text-card-foreground">
                    {new Date(viewingTask.updated_at).toLocaleString()}
                  </p>
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
            <button
              onClick={() => {
                setViewingTask(null);
                startEdit(viewingTask);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sửa
            </button>
            <button
              onClick={() => {
                setViewingTask(null);
                deleteTask(viewingTask.id);
              }}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={() => setViewingTask(null)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
