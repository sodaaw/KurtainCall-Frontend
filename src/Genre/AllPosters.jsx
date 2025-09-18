// src/Genre/AllPosters.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from "../components/Topnav";
import { festivals } from "../data/festivals";

export default function AllPosters() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 축제 데이터를 plays 형식으로 변환
  const festivalData = festivals.map(festival => ({
    id: festival.id,
    title: festival.title,
    posterUrl: festival.posterUrl,
    location: festival.location,
    detailUrl: festival.detailUrl,
    description: festival.description,
    university: festival.university,
    date: festival.date,
    performers: festival.performers
  }));

  const total = festivalData.length;

  // 캐러셀 타이머
  useEffect(() => {
    if (total < 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  if (isLoading) {
    return (
      <div className="genre-container">
        <Topnav />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Loading...</h2>
          <p>축제 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genre-container">
        <Topnav />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!festivalData || festivalData.length === 0) {
    return (
      <div className="genre-container">
        <Topnav />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>축제 정보 없음</h2>
          <p>표시할 축제 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentFestival = festivalData[current % total];
  console.log('포스터:', currentFestival.title, currentFestival.posterUrl); 

  return (
    <div className="genre-container">
      <Topnav />
      
      <div className="poster-carousel" style={{ justifyContent: "center" }}>
        <div className="poster-card" style={{ maxWidth: "85vw", width: "100%", minHeight: "auto" }}>
          <a 
            href={currentFestival.detailUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="poster-link"
          >
            <img 
              referrerPolicy="no-referrer" 
              src={currentFestival.posterUrl}
              alt={currentFestival.title} 
              className="poster-img"
              onError={(e) => { 
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/fallback.jpg'; 
              }}
              loading="lazy"
            />
          </a>
          <div className="poster-title">{currentFestival.title}</div>
          <div className="poster-location">{currentFestival.location.address}</div>
          <div className="poster-university">{currentFestival.university}</div>
          <div className="poster-date">{currentFestival.date}</div>
        </div>
      </div>

      {/* 좌우 버튼 + 인디케이터 */}
      <div className="slide-indicator">
        <button type="button" aria-label="이전" onClick={() => setCurrent((i) => (i - 1 + total) % total)}>‹</button>
        <span>{(current % total) + 1}/{total}</span>
        <button type="button" aria-label="다음" onClick={() => setCurrent((i) => (i + 1) % total)}>›</button>
      </div>
    </div>
  );
}