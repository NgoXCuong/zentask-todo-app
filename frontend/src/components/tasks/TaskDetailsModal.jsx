export default function TaskDetailsModal({
  viewingTask,
  setViewingTask,
  startEdit,
  deleteTask,
}) {
  if (!viewingTask) return null;

  const statusClass = {
    pending: "bg-chart-3/20 text-chart-3 border border-chart-3/30",
    inprogress: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
    completed: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-4">
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
                {viewingTask.description}
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
                  Hạn chót
                </label>
                <p className="text-card-foreground">
                  {viewingTask.due_date
                    ? new Date(viewingTask.due_date).toLocaleDateString()
                    : "No due date"}
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
