import { useState } from "react";

const TaskItem = ({ task, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || "medium",
    category: task.category || "General",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
  });

  const priorityClass = {
    high: "priority-high",
    medium: "priority-med",
    low: "priority-low",
  }[task.priority || "medium"];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    if (onUpdate) {
      await onUpdate(task._id, editForm);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      category: task.category || "General",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setIsEditing(false);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Check if due date is overdue
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);

  if (isEditing) {
    return (
      <div className={`glass-panel task-card ${priorityClass} animate-fade-in`} style={{ flexDirection: "column" }}>
        <form onSubmit={handleSave} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            className="form-input"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="Task Title"
            required
            autoFocus
          />
          <textarea
            className="form-textarea"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Description..."
            rows={2}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <select
              className="form-select"
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              style={{ padding: "8px" }}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <select
              className="form-select"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              style={{ padding: "8px" }}
            >
              <option value="Work">💼 Work</option>
              <option value="Personal">🏡 Personal</option>
              <option value="Urgent">🔥 Urgent</option>
              <option value="Project">🚀 Project</option>
              <option value="Study">📚 Study</option>
              <option value="General">📌 General</option>
            </select>
            <input
              type="date"
              className="form-input"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              style={{ padding: "8px", colorScheme: "dark" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
            <button type="button" onClick={handleCancel} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`glass-panel task-card ${task.completed ? "completed" : ""} ${priorityClass} animate-fade-in`}>
      <div className="task-main">
        <button
          type="button"
          onClick={() => onToggle(task)}
          className={`custom-checkbox ${task.completed ? "checked" : ""}`}
          title={task.completed ? "Mark as active" : "Mark as completed"}
          aria-label={task.completed ? "Mark as active" : "Mark as completed"}
        >
          {task.completed && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {task.description && <div className="task-desc">{task.description}</div>}

          <div className="task-meta">
            {/* Category */}
            {task.category && (
              <span className="badge badge-indigo" style={{ textTransform: "none", fontSize: "0.7rem", padding: "2px 8px" }}>
                {task.category}
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`badge ${
                task.priority === "high"
                  ? "badge-danger"
                  : task.priority === "low"
                  ? "badge-success"
                  : "badge-warning"
              }`}
              style={{ fontSize: "0.7rem", padding: "2px 8px" }}
            >
              {task.priority || "med"}
            </span>

            {/* Due Date Indicator */}
            {task.dueDate && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: isOverdue ? "#fb7185" : "var(--text-dim)",
                  fontWeight: isOverdue ? 600 : 400,
                }}
                title={isOverdue ? "Overdue task!" : "Due date"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && <span style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>⚠️ OVERDUE</span>}
              </span>
            )}

            {/* Created time */}
            {task.createdAt && (
              <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                Added {formatDate(task.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="btn btn-ghost btn-sm btn-icon"
          title="Edit task"
          aria-label="Edit task"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="btn btn-danger btn-sm btn-icon"
          title="Delete task"
          aria-label="Delete task"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
