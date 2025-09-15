import React from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css"; // 같은 팔레트 사용

export default function EventPanel({ date, events }) {
  const navigate = useNavigate();
  const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];

  const handleEventClick = (festival) => {
    // 축제 상세 정보 페이지로 이동 (또는 외부 링크)
    if (festival.detailUrl) {
      window.open(festival.detailUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 상세 페이지가 없으면 대학 정보로 이동
      navigate(`/festival/${festival.id}`, { 
        state: { 
          festival: festival,
          returnPath: '/'
        } 
      });
    }
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
          <li className="event-empty">해당 날짜의 축제가 없습니다.</li>
        )}
        {events.map((festival) => (
          <li 
            key={festival.id} 
            className="event-item clickable"
            onClick={() => handleEventClick(festival)}
          >
            <div className="event-left">
              <span className="event-bullet">🎪</span>
              <div className="event-info">
                <span className="event-title">{festival.title}</span>
                <span className="event-university">{festival.university}</span>
              </div>
            </div>
            <div className="event-range">{festival.date}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
