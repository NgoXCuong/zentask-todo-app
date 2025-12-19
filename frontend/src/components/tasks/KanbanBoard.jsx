import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckSquare } from "lucide-react";
import { useState } from "react";

export default function KanbanBoard({
  kanbanTasks,
  setViewingTask,
  startEdit,
  deleteTask,
}) {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const toggleExpanded = (taskId, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const columns = [
    {
      key: "pending",
      title: "Pending",
      color: "bg-chart-3",
      tasks: kanbanTasks.pending,
    },
    {
      key: "inprogress",
      title: "In Progress",
      color: "bg-chart-2",
      tasks: kanbanTasks.inprogress,
    },
    {
      key: "completed",
      title: "Completed",
      color: "bg-chart-1",
      tasks: kanbanTasks.completed,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <Card key={column.key} className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
              {column.title}
              <span
                className={`${column.color}/20 text-${
                  column.color.split("-")[1]
                } px-2 py-1 rounded-full text-xs font-medium`}
              >
                {column.tasks.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.tasks.map((task) => (
              <Card
                key={task.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  column.key === "completed" ? "opacity-75" : ""
                }`}
                onClick={() => setViewingTask(task)}
              >
                <CardContent className="p-4">
                  <h4
                    className={`font-medium text-foreground mb-2 ${
                      column.key === "completed" ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
                  {task.sub_tasks && task.sub_tasks.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={(e) => toggleExpanded(task.id, e)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <CheckSquare size={14} />
                        {expandedTasks.has(task.id) ? "Ẩn" : "Hiển thị"} nhiệm
                        vụ con ({task.sub_tasks.length})
                      </button>
                      {expandedTasks.has(task.id) && (
                        <ul className="mt-2 space-y-1 ml-4">
                          {task.sub_tasks.map((subtask) => (
                            <li
                              key={subtask.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={subtask.is_done}
                                readOnly
                                className="w-3 h-3"
                              />
                              <span
                                className={`text-sm ${
                                  subtask.is_done
                                    ? "line-through text-gray-500"
                                    : ""
                                }`}
                              >
                                {subtask.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "No due date"}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(task);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
