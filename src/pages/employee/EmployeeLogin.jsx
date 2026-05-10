import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../ui/Toast";
import { loginEmployee } from "../../services/auth";

export default function EmployeeLogin() {
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
      await loginEmployee({ email, pass });
      nav("/employee/dashboard");
    } catch (e) {
      showToast(e.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 22, color: "#fff", fontWeight: 800,
            boxShadow: "0 8px 24px rgba(59,130,246,0.3)"
          }}>T</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Sign in to mark your attendance</p>
        </div>

        {/* Login card */}
        <div className="card">
          <form
            onSubmit={(e) => { e.preventDefault(); onLogin(); }}
            autoComplete="off"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                name="emp_login_email_x"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tronxlabs.com"
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
                name="emp_login_pass_x"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter your password"
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
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <div className="hr" />

          <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            New employee?{" "}
            <button className="link-btn" onClick={() => nav("/employee/signup")}>
              Create an account
            </button>
          </p>
        </div>

        {/* Info strip */}
        <div style={{
          marginTop: 16, padding: "13px 16px",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.65
        }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>How it works — </span>
          Location is captured only when you press Check-in or Check-out. Coordinates and time are logged for verification.
        </div>
      </div>

      <Toast message={toast} type={toastType} />
    </div>
  );
}
