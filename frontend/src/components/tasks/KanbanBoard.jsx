export default function KanbanBoard({
  kanbanTasks,
  setViewingTask,
  startEdit,
  deleteTask,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pending Column */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
          <h3 className="font-semibold text-card-foreground">Pending</h3>
          <span className="bg-chart-3/20 text-chart-3 px-2 py-1 rounded-full text-xs font-medium">
            {kanbanTasks.pending.length}
          </span>
        </div>
        <div className="space-y-3">
          {kanbanTasks.pending.map((task) => (
            <div
              key={task.id}
              className="bg-background p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewingTask(task)}
            >
              <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {task.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No due date"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(task);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
          <h3 className="font-semibold text-card-foreground">In Progress</h3>
          <span className="bg-chart-2/20 text-chart-2 px-2 py-1 rounded-full text-xs font-medium">
            {kanbanTasks.inprogress.length}
          </span>
        </div>
        <div className="space-y-3">
          {kanbanTasks.inprogress.map((task) => (
            <div
              key={task.id}
              className="bg-background p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewingTask(task)}
            >
              <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {task.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No due date"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(task);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Column */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
          <h3 className="font-semibold text-card-foreground">Completed</h3>
          <span className="bg-chart-1/20 text-chart-1 px-2 py-1 rounded-full text-xs font-medium">
            {kanbanTasks.completed.length}
          </span>
        </div>
        <div className="space-y-3">
          {kanbanTasks.completed.map((task) => (
            <div
              key={task.id}
              className="bg-background p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow opacity-75"
              onClick={() => setViewingTask(task)}
            >
              <h4 className="font-medium text-foreground mb-2 line-through">
                {task.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {task.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No due date"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(task);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
