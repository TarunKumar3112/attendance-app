import React from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../services/storage";

export default function TopNav() {
  const nav = useNavigate();
  const s = getSession();
  const isLoggedIn = s?.type === "employee" || s?.type === "admin";
  const userName = s?.userName;

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => nav("/")}>
          <div className="brand-logo">T</div>
          <span className="brand-name">Tronx<span>Labs</span></span>
        </div>

        <div className="nav-links">
          {!isLoggedIn && (
            <>
              <button className="nav-chip" onClick={() => nav("/employee/login")}>
                Employee
              </button>
              <button className="nav-chip" onClick={() => nav("/admin/login")}>
                Admin
              </button>
            </>
          )}

          {isLoggedIn && userName && (
            <div className="nav-user">
              <div className="nav-avatar">{userName.charAt(0).toUpperCase()}</div>
              <span>{userName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
