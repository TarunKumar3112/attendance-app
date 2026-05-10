import React from "react";

export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || right) && (
        <div className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
