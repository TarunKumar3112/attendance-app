import React from "react";

export default function Toast({ message, type = "default", duration = 2200 }) {
  if (!message) return null;

  const typeClass =
    type === "success" ? "toast-success" :
    type === "error"   ? "toast-error"   : "";

  return (
    <div className="toast-container">
      <div
        className={`toast ${typeClass}`}
        style={{ "--toast-dur": `${duration}ms` }}
      >
        <div className="toast-message">{message}</div>
        <div className="toast-progress" />
      </div>
    </div>
  );
}
