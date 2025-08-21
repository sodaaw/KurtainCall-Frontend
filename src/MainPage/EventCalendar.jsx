import React, { useEffect, useState } from "react";
import "./Main.css"; // 스타일은 기존 것을 씁니다.

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export default function EventCalendar({ selected, onSelect, markers = new Set() }) {
  const [m, setM] = useState(selected.getMonth());
  const [y, setY] = useState(selected.getFullYear());

  useEffect(() => {
    setM(selected.getMonth());
    setY(selected.getFullYear());
  }, [selected]);

  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = Array.from({ length: firstDow }, () => null).concat(
    Array.from({ length: days }, (_, i) => i + 1)
  );

  const selKey = fmt(selected);
  const goto = (delta) => {
    const d = new Date(y, m + delta, 1);
    setY(d.getFullYear()); setM(d.getMonth());
  };

  return (
    <section className="cal cal-compact">
      <div className="cal-head">
        <button type="button" onClick={() => goto(-1)} aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h3>{y}.{String(m + 1).padStart(2, "0")}</h3>
        <button type="button" onClick={() => goto(1)} aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      <div className="cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="cal-cell cal-dow">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-cell" />;
          const date = new Date(y, m, d);
          const key = fmt(date);
          const isSel = key === selKey;
          const hasEvent = markers.has(key);
          return (
            <div key={i} className="cal-cell">
              <button
                type="button"
                className={`cal-day ${isSel ? "is-selected" : ""}`}
                onClick={() => onSelect(date)}
                aria-label={key}
                title={key}
              >
                {d}
              </button>
              {hasEvent && <span className="cal-dot" aria-hidden="true">◆</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
