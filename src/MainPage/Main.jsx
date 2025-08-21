// src/MainPage/Main.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from "../components/Topnav";
import posters from "./postersData.js";
import SearchModal from "../components/SearchModal";
import EventCalendar from "./EventCalendar.jsx"; // ✅ 분리한 캘린더
import EventPanel from "./EventPanel.jsx";       // ✅ 분리한 우측 패널
import "./Main.css";

// 카테고리 버튼 데이터
const CATS = [
  { 
    label: "Comedy", 
    slug: "comedy", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <circle cx="8" cy="9" r="1"/>
      <circle cx="16" cy="9" r="1"/>
      <path d="M12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>`
  },
  { 
    label: "Romance", 
    slug: "romance", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`
  },
  { 
    label: "Horror", 
    slug: "horror", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M12 12c-2.5 0-4.5 1.5-4.5 4.5h9c0-3-2-4.5-4.5-4.5z"/>
    </svg>`
  },
  { 
    label: "Tragedy", 
    slug: "tragedy", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M12 12c-2.5 0-4.5 1.5-4.5 4.5h9c0-3-2-4.5-4.5-4.5z"/>
    </svg>`
  },
  { 
    label: "Thriller", 
    slug: "thriller", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M12 12c-2.5 0-4.5 1.5-4.5 4.5h9c0-3-2-4.5-4.5-4.5z"/>
    </svg>`
  },
  { 
    label: "Musical", 
    slug: "musical", 
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>`
  },
];

/* ===== 임시 이벤트 데이터(추후 API로 교체 가능) ===== */
const EVENTS = [
  { id: 1, title: "Pixel Space 2025", start: "2025-07-28", end: "2025-09-06" },
  { id: 2, title: "One Step at a Time : Heehwan Seo", start: "2025-07-11", end: "2025-10-12" },
  { id: 3, title: "Looking at the Calm Light and the Blue Sky", start: "2025-08-06", end: "2025-08-28" },
  { id: 4, title: "BAZAAR Exhibition : IN-BETWEEN", start: "2025-08-08", end: "2025-08-23" },
  { id: 5, title: "YMCA Seoul : A Civic History Shaped by Youth", start: "2025-07-18", end: "2026-02-08" },
];

/* 유틸 */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inRange = (day, start, end) => day >= start && day <= end;

/* ---------------- 상단 메인이벤트(Hero) ---------------- */
function Hero() {
  const [idx, setIdx] = useState(0);
  const total = posters.length || 1;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  const current = posters[idx % total];
  if (!current) return null;

  return (
    <header className="hero">
      <h1>Main Event</h1>
      <p>Live Local. Explore Korea.</p>

             {/* 한 장만 표시 */}
       <div className="poster-carousel" style={{ justifyContent: "center" }}>
         <div className="poster-card" style={{ maxWidth: 360, width: "100%" }}>
           <a 
             href="https://www.interpark.com" 
             target="_blank" 
             rel="noopener noreferrer"
             className="poster-link"
           >
             <img src={current.image} alt={current.title} className="poster-img" />
           </a>
           <div className="poster-title">{current.title}</div>
           <div className="poster-info">{current.category}</div>
         </div>
       </div>

      {/* 좌우 버튼 + 인디케이터 유지 */}
      <div className="slide-indicator">
        <button type="button" aria-label="Previous" onClick={() => setIdx((i) => (i - 1 + total) % total)}>‹</button>
        <span>{(idx % total) + 1}/{total}</span>
        <button type="button" aria-label="Next" onClick={() => setIdx((i) => (i + 1) % total)}>›</button>
      </div>
    </header>
  );
}

/* ---------------- 카테고리 그리드 ---------------- */
function CategoryGrid({ onPick }) {
  return (
    <section className="section">
      <div className="cat-grid">
        {CATS.map((c) => (
          <button key={c.slug} className="cat" onClick={() => onPick(c.slug)}>
            <div className="cat-box">
              <div 
                className="cat-icon" 
                dangerouslySetInnerHTML={{ __html: c.icon }}
              ></div>
            </div>
            <div className="cat-label">{c.label}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 메인 컴포넌트 ---------------- */
export default function Main() {
  const navigate = useNavigate();
  const goGenre = (slug) => navigate(`/genre?category=${slug}`);

  // 검색 모달 제어
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ✅ 날짜 선택 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedKey = fmt(selectedDate);

  // ✅ 선택 날짜에 속하는 이벤트만 필터
  const eventsOfDay = useMemo(
    () => EVENTS.filter((e) => inRange(selectedKey, e.start, e.end)),
    [selectedKey]
  );

  // ✅ 달력에 표시할 마커(이벤트 있는 모든 날짜)
  const markers = useMemo(() => {
    const s = new Set();
    EVENTS.forEach((e) => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        s.add(fmt(d));
      }
    });
    return s;
  }, []);

  return (
    <div className="main-page">
      {/* 커튼 배경 요소들 */}
      <div className="top-curtain"></div>
      <div className="curtain-decoration"></div>
      
      <Topnav onSearchClick={() => setIsSearchOpen(true)} />
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

      <div className="spacer" />
      <main className="main-container">
        <Hero />
        <CategoryGrid onPick={goGenre} />

        {/* ✅ 좌: 캘린더 / 우: 이벤트 패널 */}
        <section className="schedule">
          <EventCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            markers={markers}
          />
          <EventPanel
            date={selectedDate}
            events={eventsOfDay}
          />
        </section>
      </main>
    </div>
  );
}

