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
  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">Đang tải dữ liệu...</div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Không tìm thấy công việc nào.
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}
