import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../ui/Toast";
import { loginAdmin } from "../../services/auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("default");
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "default") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 2200);
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      await loginAdmin({ email, pass });
      nav("/admin/dashboard");
    } catch (e) {
      showToast(e.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Real-time attendance tracking",
    "GPS location verification",
    "Employee analytics & logs",
  ];

  return (
    <div className="admin-login-wrap">

      {/* Left branding panel */}
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(59,130,246,0.2)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#93C5FD", fontWeight: 800, marginBottom: 24
          }}>T</div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>
            TronxLabs Admin
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.65, marginBottom: 32 }}>
            Manage attendance, verify locations, and monitor your workforce in real-time.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "#4ADE80", flexShrink: 0, fontSize: 15 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="admin-login-form-side">
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px",
              background: "var(--warning-bg)", border: "1px solid var(--warning-border)",
              borderRadius: "var(--radius-badge)", marginBottom: 18
            }}>
              <span style={{ fontSize: 12 }}>🔒</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warning-text)" }}>Admin Portal</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 6 }}>
              Sign in
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Access the admin dashboard</p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <form
              onSubmit={(e) => { e.preventDefault(); onLogin(); }}
              autoComplete="off"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="form-group">
                <label className="form-label">Admin email</label>
                <input
                  className="form-input"
                  name="admin_login_email_x"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tronxlabs.com"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  name="admin_login_pass_x"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Authenticating…
                  </>
                ) : "Sign in to Admin"}
              </button>
            </form>
          </div>

          <p style={{ marginTop: 18, fontSize: 12, color: "var(--muted2)", textAlign: "center" }}>
            Not an admin?{" "}
            <button className="link-btn" style={{ fontSize: 12 }} onClick={() => nav("/employee/login")}>
              Go to Employee Login
            </button>
          </p>
        </div>
      </div>

      <Toast message={toast} type={toastType} />
    </div>
  );
}
