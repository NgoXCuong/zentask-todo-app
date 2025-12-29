import { Loader2, Inbox } from "lucide-react"; // Import thêm các icon cần thiết
import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  loading,
  editingId,
  setEditingId,
  editTask,
  setEditTask,
  loadData,
  showMsg,
  setViewingTask,
}) {
  // Trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tải dữ liệu, vui lòng đợi...
        </p>
      </div>
    );
  }

  // Trạng thái danh sách trống
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/50">
        <div className="bg-card p-4 rounded-full shadow-sm mb-4">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground">
          Trống trải quá!
        </h3>
        <p className="text-muted-foreground max-w-[250px] text-center text-sm mt-1">
          Không tìm thấy công việc nào trong danh sách của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          editingId={editingId}
          setEditingId={setEditingId}
          editTask={editTask}
          setEditTask={setEditTask}
          loadData={loadData}
          showMsg={showMsg}
          setViewingTask={setViewingTask}
        />
      ))}
    </div>
  );
}
