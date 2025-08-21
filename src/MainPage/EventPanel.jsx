import React from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css"; // 같은 팔레트 사용

export default function EventPanel({ date, events }) {
  const navigate = useNavigate();
  const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];

  const handleEventClick = (event) => {
    // 이벤트 상세 정보 페이지로 이동
    navigate(`/event/${event.id}`, { 
      state: { 
        event: event,
        returnPath: '/'
      } 
    });
  };

  return (
    <aside className="events-panel">
      <header className="events-head">
        <h3>
          {key}
          <span className="weekday">({weekday})</span>
        </h3>
      </header>

      <ul className="event-list">
        {events.length === 0 && (
          <li className="event-empty">해당 날짜의 이벤트가 없습니다.</li>
        )}
        {events.map((e) => (
          <li 
            key={e.id} 
            className="event-item clickable"
            onClick={() => handleEventClick(e)}
          >
            <div className="event-left">
              <span className="event-bullet">◆</span>
              <span className="event-title">{e.title}</span>
            </div>
            <div className="event-range">{e.start} ~ {e.end}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
