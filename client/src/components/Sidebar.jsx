import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
import API from "../services/api";

export default function Sidebar() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsGuest(false);
      fetchCloudTasks();
    } else {
      setIsGuest(true);
      fetchLocalTasks();
    }
  }, []);

  // CLOUD TASK ACTIONS (Logged-in)
  const fetchCloudTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load cloud tasks:", err.message);
    }
  };

  // LOCAL TASK ACTIONS (Guest fallback)
  const fetchLocalTasks = () => {
    const local = localStorage.getItem("local_tasks");
    if (local) {
      try {
        setTasks(JSON.parse(local));
      } catch (e) {
        setTasks([]);
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!isGuest) {
      try {
        const res = await API.post("/tasks", { title: title.trim() });
        setTasks((prev) => [res.data, ...prev]);
      } catch (err) {
        console.error("Failed to add cloud task:", err.message);
      }
    } else {
      const newTask = {
        _id: String(Date.now()),
        title: title.trim(),
        completed: false,
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem("local_tasks", JSON.stringify(updated));
    }
    setTitle("");
  };

  const handleToggleTask = async (id, completed) => {
    if (!isGuest) {
      try {
        await API.put(`/tasks/${id}`, { completed: !completed });
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, completed: !completed } : t))
        );
      } catch (err) {
        console.error("Failed to update cloud task:", err.message);
      }
    } else {
      const updated = tasks.map((t) => (t._id === id ? { ...t, completed: !completed } : t));
      setTasks(updated);
      localStorage.setItem("local_tasks", JSON.stringify(updated));
    }
  };

  const handleDeleteTask = async (id) => {
    if (!isGuest) {
      try {
        await API.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        console.error("Failed to delete cloud task:", err.message);
      }
    } else {
      const updated = tasks.filter((t) => t._id !== id);
      setTasks(updated);
      localStorage.setItem("local_tasks", JSON.stringify(updated));
    }
  };

  return (
    <div className="glass-panel p-5 rounded-3xl flex flex-col h-full border-border/40 shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
        <ListTodo className="h-4.5 w-4.5 text-accent" />
        <h4 className="text-sm font-bold tracking-wider uppercase text-white">Study Planner</h4>
      </div>

      {/* Input */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add focus task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-input text-white border border-border/50 outline-none text-xs placeholder:text-muted-foreground/60 focus:border-accent transition-all"
        />
        <button
          type="submit"
          className="p-2.5 bg-accent hover:scale-[1.02] active:scale-95 text-background rounded-xl shadow-cyanGlow cursor-pointer transition-transform"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Tasks checklist */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {tasks.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/75 text-center mt-6 leading-relaxed">
            No study tasks yet. Add a focus checklist item above!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/30 hover:border-border transition-all"
            >
              <div 
                onClick={() => handleToggleTask(task._id, task.completed)}
                className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0 fill-accent/15" />
                ) : (
                  <Circle className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                )}
                <span className={`text-xs font-semibold select-none break-all leading-normal ${
                  task.completed ? "line-through text-muted-foreground" : "text-white"
                }`}>
                  {task.title}
                </span>
              </div>
              
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-muted-foreground hover:text-red-400 p-1 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}