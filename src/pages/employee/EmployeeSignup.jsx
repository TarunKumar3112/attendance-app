import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../ui/Toast";
import { signupEmployee } from "../../services/auth";

export default function EmployeeSignup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

  const onSignup = async () => {
    try {
      setLoading(true);
      await signupEmployee({ name, phone, email, pass });
      showToast("Account created — redirecting…", "success");
      setTimeout(() => { setToast(""); nav("/employee/login"); }, 1200);
    } catch (e) {
      showToast(e.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: "100%", maxWidth: 480 }}>

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
            Join TronxLabs
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Create your employee account to get started</p>
        </div>

        {/* Signup card */}
        <div className="card">
          <form
            onSubmit={(e) => { e.preventDefault(); onSignup(); }}
            autoComplete="off"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  className="form-input"
                  name="emp_signup_name_x"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone{" "}
                  <span style={{ color: "var(--muted2)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="form-input"
                  name="emp_signup_phone_x"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9xxxxxxxxx"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  name="emp_signup_email_x"
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
                  name="emp_signup_pass_x"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Privacy note */}
            <div style={{
              padding: "10px 14px",
              background: "#F8FAFC",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.6
            }}>
              🔒 Location is only captured when you press Check-in or Check-out — never in the background.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ flex: 1, padding: "12px", fontSize: 15 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account…
                  </>
                ) : "Create account"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={loading}
                onClick={() => nav("/employee/login")}
                style={{ padding: "12px 20px" }}
              >
                Back
              </button>
            </div>
          </form>

          <div className="hr" />

          <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <button className="link-btn" onClick={() => nav("/employee/login")}>
              Sign in
            </button>
          </p>
        </div>
      </div>

      <Toast message={toast} type={toastType} />
    </div>
  );
}
