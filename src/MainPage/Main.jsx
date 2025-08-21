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
    icon: "😄",
    description: "웃음과 유머"
  },
  { 
    label: "Romance", 
    slug: "romance", 
    icon: "💕",
    description: "사랑과 로맨스"
  },
  { 
    label: "Horror", 
    slug: "horror", 
    icon: "👻",
    description: "공포와 스릴"
  },
  { 
    label: "Tragedy", 
    slug: "tragedy", 
    icon: "😢",
    description: "비극과 슬픔"
  },
  { 
    label: "Thriller", 
    slug: "thriller", 
    icon: "💥",
    description: "긴장과 액션"
  },
  { 
    label: "Musical", 
    slug: "musical", 
    icon: "🎵",
    description: "음악과 노래"
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
              <div className="cat-icon">{c.icon}</div>
            </div>
            <div className="cat-label">{c.label}</div>
            <div className="cat-description">{c.description}</div>
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

