import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "completed", "high"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "priority", "dueDate"
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load tasks from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async (data) => {
    try {
      const res = await api.post("/tasks", data);
      setTasks((prev) => [res.data, ...prev]);
      showToast("✨ Task added successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create task", "error");
    }
  };

  const handleToggle = async (task) => {
    try {
      const updatedStatus = !task.completed;
      const res = await api.put(`/tasks/${task._id}`, { completed: updatedStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      showToast(
        updatedStatus ? "🎉 Task marked as complete!" : "↩️ Task restored to active",
        "success"
      );
    } catch (err) {
      showToast("Failed to update task status", "error");
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    try {
      const res = await api.put(`/tasks/${id}`, updatedFields);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      showToast("💾 Task changes saved", "success");
    } catch (err) {
      showToast("Failed to update task", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast("🗑️ Task removed", "success");
    } catch (err) {
      showToast("Failed to delete task", "error");
    }
  };

  const handleClearCompleted = async () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    if (!window.confirm(`Delete all ${completedCount} completed task(s)?`)) return;

    try {
      await api.delete("/tasks/completed/clear");
      setTasks((prev) => prev.filter((t) => !t.completed));
      showToast(`Cleared ${completedCount} completed tasks`, "success");
    } catch (err) {
      // Fallback: delete one by one if backend route is unavailable
      try {
        const completed = tasks.filter((t) => t.completed);
        await Promise.all(completed.map((t) => api.delete(`/tasks/${t._id}`)));
        setTasks((prev) => prev.filter((t) => !t.completed));
        showToast(`Cleared ${completedCount} completed tasks`, "success");
      } catch (innerErr) {
        showToast("Could not clear completed tasks", "error");
      }
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter((t) => !t.completed && t.priority === "high").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, highPriority, rate };
  }, [tasks]);

  // Filter & Search computation
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab status filter
        if (activeTab === "active" && task.completed) return false;
        if (activeTab === "completed" && !task.completed) return false;
        if (activeTab === "high" && task.priority !== "high") return false;

        // Category filter
        if (selectedCategory !== "all" && task.category !== selectedCategory) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = (task.description || "").toLowerCase().includes(query);
          const matchCategory = (task.category || "").toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "priority") {
          const rank = { high: 3, medium: 2, low: 1 };
          return (rank[b.priority] || 2) - (rank[a.priority] || 2);
        }
        if (sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });
  }, [tasks, activeTab, selectedCategory, searchQuery, sortBy]);

  // Greeting helper
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", paddingTop: "120px" }}>
        <div className="spinner" style={{ width: "36px", height: "36px", borderWidth: "3px", borderColor: "rgba(99,102,241,0.2)", borderTopColor: "var(--primary-500)" }} />
        <p style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
          Loading your workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <div>
            <h1 className="dashboard-title">
              {greeting}, {user?.name || "Creator"} 👋
            </h1>
            <p className="dashboard-date">{todayFormatted} • Focus on what matters today</p>
          </div>

          {metrics.completed > 0 && (
            <button
              type="button"
              onClick={handleClearCompleted}
              className="btn btn-secondary btn-sm"
              title="Delete all finished tasks"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              <span>Clear Completed ({metrics.completed})</span>
            </button>
          )}
        </div>
      </header>

      {/* KPI / Metrics Row */}
      <section className="metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-info">
            <span className="metric-label">Total Tasks</span>
            <span className="metric-value">{metrics.total}</span>
            <span className="metric-sub">Across all categories</span>
          </div>
          <div className="metric-icon-box metric-icon-indigo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="2" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-info">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-sub">{metrics.highPriority} high priority</span>
          </div>
          <div className="metric-icon-box metric-icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-info">
            <span className="metric-label">Completed</span>
            <span className="metric-value">{metrics.completed}</span>
            <span className="metric-sub">Tasks accomplished</span>
          </div>
          <div className="metric-icon-box metric-icon-emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-info" style={{ width: "100%", paddingRight: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="metric-label">Productivity</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                {metrics.rate}%
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", margin: "10px 0 6px" }}>
              <div
                style={{
                  height: "100%",
                  width: `${metrics.rate}%`,
                  background: "linear-gradient(90deg, var(--primary-500), var(--accent-cyan))",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <span className="metric-sub">Completion score</span>
          </div>
          <div className="metric-icon-box metric-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
        </div>
      </section>

      {/* Task Creation Form */}
      <TaskForm onAdd={handleAdd} />

      {/* Search & Filter Toolbar */}
      <div className="toolbar-panel">
        <div className="toolbar-tabs">
          <button
            type="button"
            className={`toolbar-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <span>All</span>
            <span className="tab-count">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`toolbar-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <span>Active</span>
            <span className="tab-count">{metrics.pending}</span>
          </button>
          <button
            type="button"
            className={`toolbar-tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <span>Done</span>
            <span className="tab-count">{metrics.completed}</span>
          </button>
          <button
            type="button"
            className={`toolbar-tab ${activeTab === "high" ? "active" : ""}`}
            onClick={() => setActiveTab("high")}
          >
            <span>High Priority</span>
            <span className="tab-count">{tasks.filter((t) => t.priority === "high").length}</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
          {/* Category Filter */}
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: "auto", minWidth: "130px", padding: "8px 12px", fontSize: "0.875rem" }}
          >
            <option value="all">📁 All Categories</option>
            <option value="Work">💼 Work</option>
            <option value="Personal">🏡 Personal</option>
            <option value="Urgent">🔥 Urgent</option>
            <option value="Project">🚀 Project</option>
            <option value="Study">📚 Study</option>
            <option value="General">📌 General</option>
          </select>

          {/* Sort By */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "auto", minWidth: "130px", padding: "8px 12px", fontSize: "0.875rem" }}
          >
            <option value="newest">🕒 Newest First</option>
            <option value="oldest">⏳ Oldest First</option>
            <option value="priority">🔥 High Priority First</option>
            <option value="dueDate">📅 By Due Date</option>
          </select>

          {/* Search Box */}
          <div className="input-wrapper toolbar-search">
            <span className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="form-input input-with-icon"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px 14px 8px 38px", fontSize: "0.875rem" }}
            />
            {searchQuery && (
              <button
                type="button"
                className="input-action"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <section className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="glass-panel empty-state animate-fade-in">
            <div className="empty-icon-box">
              {searchQuery || selectedCategory !== "all" || activeTab !== "all" ? (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ) : (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )}
            </div>
            <h3 className="empty-title">
              {searchQuery || selectedCategory !== "all" || activeTab !== "all"
                ? "No matching tasks found"
                : "You're all caught up!"}
            </h3>
            <p className="empty-subtitle">
              {searchQuery || selectedCategory !== "all" || activeTab !== "all"
                ? "Try adjusting your search query, status tab, or category filters."
                : "No pending tasks right now. Create a new task above or take a well-deserved break."}
            </p>
            {(searchQuery || selectedCategory !== "all" || activeTab !== "all") && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setActiveTab("all");
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default Dashboard;
