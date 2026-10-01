import { useState } from "react";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || null,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setIsExpanded(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-panel task-form-panel animate-fade-in">
      <div className="task-form-header">
        <div className="task-form-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary-500)" }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create New Task</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}
        >
          {isExpanded ? "Collapse" : "Options +"}
        </button>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="task-form-row">
          <input
            type="text"
            className="form-input"
            placeholder="What needs to be done? (e.g. Prepare client presentation)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!title.trim() || submitting}
            style={{ minWidth: "120px" }}
          >
            {submitting ? (
              <span className="spinner" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="task-form-details">
            <textarea
              className="form-textarea"
              placeholder="Add details, notes, or sub-tasks (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "4px" }}>
              {/* Category Selection */}
              <div>
                <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.875rem" }}
                >
                  <option value="Work">💼 Work</option>
                  <option value="Personal">🏡 Personal</option>
                  <option value="Urgent">🔥 Urgent</option>
                  <option value="Project">🚀 Project</option>
                  <option value="Study">📚 Study</option>
                  <option value="General">📌 General</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.875rem", colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="task-form-footer">
              <div className="task-priority-chips">
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", marginRight: "4px" }}>
                  Priority:
                </span>
                <button
                  type="button"
                  className={`priority-chip ${priority === "low" ? "active-low" : ""}`}
                  onClick={() => setPriority("low")}
                >
                  🟢 Low
                </button>
                <button
                  type="button"
                  className={`priority-chip ${priority === "medium" ? "active-med" : ""}`}
                  onClick={() => setPriority("medium")}
                >
                  🟡 Medium
                </button>
                <button
                  type="button"
                  className={`priority-chip ${priority === "high" ? "active-high" : ""}`}
                  onClick={() => setPriority("high")}
                >
                  🔴 High
                </button>
              </div>

              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Tip: Press <kbd style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>Ctrl+Enter</kbd> to save
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
