import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../ui/Card";
import Toast from "../../ui/Toast";
import { getSession } from "../../services/storage";
import { createAttendance } from "../../services/attendance";
import { getUserAttendanceRecords } from "../../services/supabase";
import { logoutEmployee } from "../../services/auth";

function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return iso; }
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  } catch { return iso; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export default function EmployeeDashboard() {
  const nav = useNavigate();
  const session = getSession();

  const me = useMemo(() => {
    if (!session.userId) return null;
    return {
      id: session.userId,
      email: session.userId,
      name: session.userName || "Employee"
    };
  }, [session.userId, session.userName]);

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("default");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState({ status: "Not working", latest: null });
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const showToast = (msg, type = "default") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 2200);
  };

  const refresh = async () => {
    if (!me) return;
    try {
      const records = await getUserAttendanceRecords(me.name);
      setLogs(records.slice(0, 10));
      const latest = records[0];
      if (!latest) {
        setStatus({ status: "Not working", latest: null });
      } else {
        setStatus({
          status: latest.type === "checkin" ? "Working" : "Not working",
          latest
        });
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { refresh(); }, [me?.id]);

  const doAction = async (type) => {
    if (!me) return;
    setBusy(true);
    try {
      console.log("🔄 Starting", type, "for user:", me.name);
      await createAttendance({ userId: me.id, type, userName: me.name });
      console.log("✅", type, "successful");
      showToast(type === "checkin" ? "Checked in successfully!" : "Checked out.", type === "checkin" ? "success" : "default");
      refresh();
    } catch (error) {
      console.error("❌ Error during", type, ":", error.message);
      showToast("❌ " + (error.message || "Location permission needed (use HTTPS or localhost)."), "error");
    } finally {
      setBusy(false);
    }
  };

  const onLogout = () => {
    logoutEmployee();
    nav("/employee/login");
  };

  const isWorking = status.status === "Working";
  const today = new Date().toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const todayLogs = logs.filter(r => {
    const d = new Date(r.time);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <main className="page">

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", margin: 0 }}>
            Good {getGreeting()}, {me?.name?.split(" ")[0] || "there"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{today}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ gap: 6 }}>
          <LogoutIcon /> Logout
        </button>
      </div>

      <div className="grid">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Check-in / Check-out card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>Current Status</div>
                <span className={`badge ${isWorking ? "badge-success" : "badge-neutral"}`}>
                  <span className="badge-dot" />
                  {isWorking ? "Checked In" : "Not Checked In"}
                </span>
              </div>
              {status.latest && (
                <span className="location-pill">
                  <PinIcon /> GPS Active
                </span>
              )}
            </div>

            {loadingData ? (
              <div className="skeleton" style={{ height: 68, borderRadius: 12 }} />
            ) : (
              <button
                className={`checkin-btn ${isWorking ? "checkout" : "checkin"}`}
                disabled={busy}
                onClick={() => doAction(isWorking ? "checkout" : "checkin")}
              >
                {busy ? "Processing…" : isWorking ? "Check Out" : "Check In"}
              </button>
            )}

            {status.latest && (
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
                Last {status.latest.type === "checkin" ? "check-in" : "check-out"}:{" "}
                <strong style={{ color: "var(--text)" }}>{fmt(status.latest.time)}</strong>
                {status.latest.address && (
                  <>
                    {" · "}
                    <span className="location-pill" style={{ marginLeft: 2 }}>
                      <PinIcon /> {status.latest.address}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Today's activity */}
          {todayLogs.length > 0 && (
            <div className="card">
              <div className="section-title">Today's Activity</div>
              <div className="list">
                {todayLogs.map(r => (
                  <div key={r.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${r.type === "checkin" ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11 }}>
                        {r.type === "checkin" ? "In" : "Out"}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtTime(r.time)}</span>
                    </div>
                    <span className="location-pill">
                      <PinIcon />
                      {Number(r.lat).toFixed(4)}, {Number(r.lng).toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — history */}
        <Card title="Attendance History" subtitle="Your last 10 records">
          {loadingData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ padding: "14px", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div className="skeleton skeleton-line w-3-4" />
                  <div className="skeleton skeleton-line w-1-2" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No records yet</div>
              <p style={{ fontSize: 12, color: "var(--muted2)" }}>Press Check In to start tracking</p>
            </div>
          ) : (
            <div className="list">
              {logs.map(r => (
                <div key={r.id} className="list-item" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span className={`badge ${r.type === "checkin" ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11 }}>
                          {r.type === "checkin" ? "Check In" : "Check Out"}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{fmtDate(r.time)}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                        {fmtTime(r.time)}
                      </div>
                      <div className="mono text-muted2">
                        {Number(r.lat).toFixed(6)}, {Number(r.lng).toFixed(6)}
                      </div>
                      {r.address && (
                        <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 3 }}>{r.address}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Toast message={toast} type={toastType} />
    </main>
  );
}
