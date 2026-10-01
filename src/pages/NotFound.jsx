import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="auth-page">
    <div className="auth-card-container animate-fade-in" style={{ textAlign: "center" }}>
      <div className="glass-panel auth-card" style={{ padding: "48px 32px" }}>
        <div style={{ fontSize: "4rem", fontWeight: 800, background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          404
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "12px 0 8px" }}>Page Not Found</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: "24px" }}>
          The page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
