import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllAttendanceRecords } from "../../services/supabase";
import { logoutAdmin } from "../../services/auth";

function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

export default function AdminDashboard() {
  const nav = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [users, records] = await Promise.all([
          getAllUsers(),
          getAllAttendanceRecords()
        ]);
        console.log("📦 Fetched users:", users);
        console.log("📊 Fetched records:", records);
        const employeesList = users
          .filter((u) => u.role === "employee")
          .sort((a, b) => a.name.localeCompare(b.name));
        setEmployees(employeesList);
        setAllRecords(records);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getLatestStatus = (user) => {
    const userRecords = allRecords
      .filter((r) => r.userName === user.name)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    const latest = userRecords[0];
    if (!latest) return { status: "Not working", latest: null };
    return { status: latest.type === "checkin" ? "Working" : "Not working", latest };
  };

  const getUserLogs = (userName) => {
    let records = allRecords
      .filter((r) => r.userName === userName)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    if (dateFilter) {
      records = records.filter(r => new Date(r.time).toISOString().startsWith(dateFilter));
    }
    return records;
  };

  const workingCount = useMemo(() => {
    return employees.filter(u => getLatestStatus(u).status === "Working").length;
  }, [employees, allRecords]);

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [employees, search]);

  const selected = employees.find((e) => e.id === selectedId) || null;
  const selectedLogs = selected ? getUserLogs(selected.name) : [];

  const toggleSelect = (id) => setSelectedId(prev => prev === id ? null : id);

  const onLogout = () => { logoutAdmin(); nav("/admin/login"); };

  const stats = [
    { value: employees.length, label: "Total Employees", color: "var(--text)" },
    { value: workingCount, label: "Currently Working", color: "var(--success)" },
    { value: employees.length - workingCount, label: "Not Working", color: "var(--muted)" },
    { value: allRecords.length, label: "Total Records", color: "var(--primary)" },
  ];

  return (
    <main className="page">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Monitor employee attendance and location logs</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ gap: 6 }}>
          <LogoutIcon /> Logout
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: loading ? "var(--muted2)" : s.color }}>
              {loading ? "—" : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Employee table card */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="card-title">Employees</h2>
            <p className="card-subtitle">Click any row to expand activity logs</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="form-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <input
              className="form-input"
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              title="Filter logs by date"
              style={{ width: 160 }}
            />
            {dateFilter && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDateFilter("")}
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div className="skeleton skeleton-line w-3-4" />
                  <div className="skeleton skeleton-line w-1-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">
              {search ? "No employees match your search" : "No employees yet"}
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Last activity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(u => {
                  const st = getLatestStatus(u);
                  const isWorking = st.status === "Working";
                  const isExpanded = selectedId === u.id;

                  return (
                    <React.Fragment key={u.id}>
                      <tr
                        style={{ cursor: "pointer" }}
                        className={isExpanded ? "expanded" : ""}
                        onClick={() => toggleSelect(u.id)}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                              background: isWorking ? "var(--success-bg)" : "#F1F5F9",
                              color: isWorking ? "var(--success-text)" : "var(--muted)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 700
                            }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isWorking ? "badge-success" : "badge-neutral"}`}>
                            <span className="badge-dot" />
                            {isWorking ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--muted)" }}>
                          {st.latest ? fmt(st.latest.time) : "—"}
                        </td>
                        <td>
                          {st.latest ? (
                            <span className="location-pill">
                              <PinIcon />
                              {Number(st.latest.lat).toFixed(3)}, {Number(st.latest.lng).toFixed(3)}
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted2)", fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={4} style={{ padding: 0, background: "#F8FAFC" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                              <div className="section-title" style={{ marginBottom: 12 }}>
                                Activity Log — {u.name}
                                {dateFilter && <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 6 }}>({new Date(dateFilter).toLocaleDateString([], { month: "short", day: "numeric" })})</span>}
                              </div>

                              {selectedLogs.length === 0 ? (
                                <div className="empty-state" style={{ padding: "24px" }}>
                                  <div className="empty-state-icon">📭</div>
                                  <div className="empty-state-text">No records{dateFilter ? " for this date" : ""}</div>
                                </div>
                              ) : (
                                <div className="list" style={{ maxHeight: 320, overflowY: "auto" }}>
                                  {selectedLogs.slice(0, 25).map(r => (
                                    <div key={r.id} className="list-item" style={{ cursor: "default", background: "#fff" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                          <span className={`badge ${r.type === "checkin" ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11, marginTop: 1 }}>
                                            {r.type === "checkin" ? "In" : "Out"}
                                          </span>
                                          <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                                              {fmt(r.time)}
                                            </div>
                                            <div className="mono text-muted2">
                                              {Number(r.lat).toFixed(6)}, {Number(r.lng).toFixed(6)}
                                            </div>
                                            {r.address && (
                                              <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 2 }}>{r.address}</div>
                                            )}
                                          </div>
                                        </div>
                                        {r.device?.platform && (
                                          <div className="mono text-muted2" style={{ fontSize: 11 }}>{r.device.platform}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
