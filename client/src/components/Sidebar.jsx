import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
import API from "../services/api";

const CATEGORIES = [
  { value: "General", label: "📋 General" },
  { value: "Coding", label: "💻 Coding" },
  { value: "Math", label: "📐 Mathematics" },
  { value: "Science", label: "🔬 Science" },
  { value: "Writing", label: "📝 Writing" },
  { value: "Languages", label: "🗣️ Languages" },
];

const PRIORITIES = [
  { value: "Low", label: "🟢 Low" },
  { value: "Medium", label: "🟡 Medium" },
  { value: "High", label: "🔴 High" },
];

export default function Sidebar() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
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
        const res = await API.post("/tasks", {
          title: title.trim(),
          category,
          priority,
        });
        setTasks((prev) => [res.data, ...prev]);
      } catch (err) {
        console.error("Failed to add cloud task:", err.message);
      }
    } else {
      const newTask = {
        _id: String(Date.now()),
        title: title.trim(),
        completed: false,
        category,
        priority,
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem("local_tasks", JSON.stringify(updated));
    }
    setTitle("");
    setCategory("General");
    setPriority("Medium");
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

  const getPriorityBadgeStyle = (p) => {
    if (p === "High") return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    if (p === "Low") return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  };

  const getCategoryEmoji = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.label.split(" ")[0] : "📋";
  };

  return (
    <div className="glass-panel p-5 rounded-3xl flex flex-col h-full border-border/40 shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
        <ListTodo className="h-4.5 w-4.5 text-accent" />
        <h4 className="text-sm font-bold tracking-wider uppercase text-white">Study Planner</h4>
      </div>

      {/* Input */}
      <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add focus task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-input text-white border border-border/50 outline-none text-xs placeholder:text-muted-foreground/60 focus:border-accent transition-all"
          />
          <button
            type="submit"
            className="p-3 bg-accent hover:scale-[1.02] active:scale-95 text-background rounded-xl shadow-cyanGlow cursor-pointer transition-transform"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Priority & Category Selectors */}
        <div className="flex gap-2 w-full">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-2 py-2 rounded-xl bg-input/70 text-white border border-border/40 outline-none text-[10px] cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-background text-white">
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 px-2 py-2 rounded-xl bg-input/70 text-white border border-border/40 outline-none text-[10px] cursor-pointer"
          >
            {PRIORITIES.map(pri => (
              <option key={pri.value} value={pri.value} className="bg-background text-white">
                {pri.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Tasks checklist */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 mt-6 py-8 border border-dashed border-border/30 rounded-2xl bg-muted/5 select-none">
            <ListTodo className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground/80 max-w-[180px] leading-relaxed">
              No study tasks yet. Add a focus checklist item above!
            </p>
          </div>
        ) : (
          tasks.map((task) => (
                             <div
              key={task._id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30 hover:border-border transition-all animate-slide-down"
            >
              <div 
                onClick={() => handleToggleTask(task._id, task.completed)}
                className="flex items-start gap-2.5 cursor-pointer flex-1 mr-2 min-w-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0 fill-accent/15 mt-0.5" />
                ) : (
                  <Circle className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className={`text-xs font-semibold select-none break-words leading-normal ${
                    task.completed ? "line-through text-muted-foreground" : "text-white"
                  }`}>
                    {task.title}
                  </span>
                  
                  {/* Category & Priority Badge display */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-plum">
                      {getCategoryEmoji(task.category)} {task.category}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide ${getPriorityBadgeStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
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
