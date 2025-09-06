// src/components/HeaderBar.jsx
import React from "react";

export default function HeaderBar({ oldTestament, newTestament }) {
  return (
    <div className="header-bar">
      {/* 🔎 LEFT - SEARCH */}
      <div className="header-section">
        <label className="header-label">
          SEARCH THE BIBLE <span className="small">(Advanced)</span>
        </label>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search words or verses..."
            className="header-input"
          />
          <button className="header-btn">➤</button>
        </div>
      </div>

      {/* 📚 RIGHT - SELECT BOOK */}
      <div className="header-section">
        <label className="header-label">
          SELECT A BOOK <span className="small">(Index)</span>
        </label>
        <div className="header-controls">
          <select>
            {[...oldTestament, ...newTestament].map((book, index) => (
              <option key={index}>{book}</option>
            ))}
          </select>

          <select>
            {Array.from({ length: 50 }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>

          <select>
            {Array.from({ length: 176 }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>

          <button className="header-btn">➤</button>
        </div>
      </div>
    </div>
  );
}
