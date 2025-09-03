// src/MainPage/Main.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from "../components/Topnav";
// import SearchModal from "../components/SearchModal";
import EventCalendar from "./EventCalendar"; // ✅ 분리한 캘린더
import EventPanel from "./EventPanel";       // ✅ 분리한 우측 패널
import { playAPI } from "../services/api";
import "./Main.css";

// 카테고리 버튼 데이터 (API에서 받아올 예정)
const DEFAULT_CATS = [
  { 
    label: "Comedy", 
    slug: "comedy", 
    //icon: "😄",
    description: "웃음과 유머"
  },
  { 
    label: "Musical", 
    slug: "musical", 
    //icon: "🎵",
    description: "음악과 노래"
  },
];

/* 유틸 */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inRange = (day, start, end) => day >= start && day <= end;

/* ---------------- 상단 메인이벤트(Hero) ---------------- */
function Hero({ plays, isLoading, error, isLoggedIn = false }) {
  const [idx, setIdx] = useState(0);
  const total = plays?.length || 0;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  if (isLoading) {
    return (
      <header className="hero">
        <h1>KurtainCall</h1>
        <p className="tagline">발견의 즐거움, 로컬 공연 큐레이션.</p>
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="hero">
        <h1>KurtainCall</h1>
        <p className="tagline">발견의 즐거움, 로컬 공연 큐레이션.</p>
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p className="error-title">데이터를 불러올 수 없습니다</p>
          <p className="error-detail">백엔드 서버가 실행 중인지 확인해주세요.</p>
        </div>
      </header>
    );
  }

  if (!plays || plays.length === 0) {
    return (
      <header className="hero">
        <h1>KurtainCall</h1>
        <p className="tagline">발견의 즐거움, 로컬 공연 큐레이션.</p>
        <div className="no-data">
          <div className="no-data-icon">📭</div>
          <p className="no-data-title">표시할 데이터가 없습니다</p>
          <p className="no-data-detail">현재 등록된 공연 정보가 없습니다.</p>
        </div>
      </header>
    );
  }

  const current = plays[idx % total];
  console.log('포스터:', current.title, current.posterUrl); 

  // current가 유효한지 한번 더 확인
  if (!current) {
    return (
      <header className="hero">
        <h1>KurtainCall</h1>
        <p className="tagline">발견의 즐거움, 로컬 공연 큐레이션.</p>
        <div className="no-data">
          <div className="no-data-icon">📭</div>
          <p className="no-data-title">표시할 데이터가 없습니다</p>
          <p className="no-data-detail">현재 등록된 공연 정보가 없습니다.</p>
        </div>
      </header>
    );
  }

  return (
    <header className="hero">
      {/* 위 작대기 추가 */}
      {/* <div className="hero-line top" aria-hidden="true" /> */}
      
      
      {/* 게스트 칩 */}
      {/* {!isLoggedIn && (
        <div className="hero-sub" style={{ marginTop: '15px', marginBottom: '10px' }}>
          <span className="status-chip" aria-label="게스트 모드">
            게스트 모드 · 랜덤 추천
          </span>
        </div>
      )} */}
      

      {/* 제목 */}
      <h1>KurtainCall</h1>

      {/* 태그라인 */}
      <p className="tagline">발견의 즐거움, 로컬 공연 큐레이션.</p>
    </header>
  );
}

/* ---------------- 추천 공연 슬라이드 ---------------- */
function RecommendedShows({ plays, isLoading, error }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const total = plays?.length || 0;

  useEffect(() => {
    if (total <= 3) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [total, currentIndex]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (total - 2));
      setIsTransitioning(false);
    }, 800);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + (total - 2)) % (total - 2));
      setIsTransitioning(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <section className="recommended-section">
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>추천 공연을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error || !plays || plays.length === 0) {
    return (
      <section className="recommended-section">
        <div className="no-data">
          <div className="no-data-icon">🎭</div>
          <p className="no-data-title">추천 공연을 불러올 수 없습니다</p>
          <p className="no-data-detail">잠시 후 다시 시도해주세요.</p>
        </div>
      </section>
    );
  }

  // 3개씩 보여주기 위해 슬라이드 계산
  const cardWidth = 33.333; // 각 카드의 너비 (%)
  const gap = 20; // 카드 간 간격 (px)
  const translateX = -(currentIndex * (cardWidth + gap * 2 / 3));

  return (
    <section className="recommended-section">
      <div className="shows-slider">
        <div 
          className={`shows-container ${isTransitioning ? 'transitioning' : ''}`}
          style={{ transform: `translateX(${translateX}%)` }}
        >
          {plays.map((play, index) => (
            <div key={play.id || index} className="show-card">
              <a 
                href={play.detailUrl || "https://www.interpark.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="show-link"
              >
                {/* <img 
                  referrerPolicy="no-referrer" 
                  src={play.posterUrl} 
                  alt={play.title} 
                  className="show-img" 
                /> */}
                {/* <div className="poster-frame">
                  <img
                    referrerPolicy="no-referrer"
                    src={play.posterUrl}
                    alt={play.title}
                    className="show-img--contain"
                    loadint="lazy"
                  />
                </div> */}
                <div className="poster-only">
                  <img
                    referrerPolicy="no-referrer"
                    src={play.posterUrl}
                    alt={play.title}
                    className="poster-img"
                    loading="lazy"
                  />
                </div>
              </a>
              {/* <div className="show-title">{play.title}</div>
              {play.location?.address && (
                <div className="show-location">{play.location.address}</div>
              )} */}
              <div className="show-meta">
                <div className="show-title">{play.title}</div>
                {play.location?.address && (
                  <div className="show-location">{play.location.address}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 슬라이드 인디케이터 */}
        {/* <div className="slide-indicator">
          <button 
            type="button" 
            aria-label="이전" 
            onClick={handlePrev}
            disabled={isTransitioning}
            className={isTransitioning ? 'disabled' : ''}
          >
            ‹
          </button>
          <span>{currentIndex + 1}/{Math.max(1, total - 2)}</span>
          <button 
            type="button" 
            aria-label="다음" 
            onClick={handleNext}
            disabled={isTransitioning}
            className={isTransitioning ? 'disabled' : ''}
          >
            ›
          </button>
        </div> */}
      </div>
    </section>
  );
}

/* ---------------- 검색 및 장르 필터 ---------------- */
function SearchAndGenre({ onSearchClick, onGenreClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleMoreGenres = () => {
    navigate('/genre');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="search-genre-section">
      {/* 검색바 */}
      <div className="search-bar">
        <form className="search-input-wrapper" onSubmit={handleSearch}>
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="원하는 장르 또는 작품을 검색해보세요." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* 장르 필터 */}
      <div className="genre-filters">
        {DEFAULT_CATS.map((cat) => (
          <button 
            key={cat.slug} 
            className="genre-filter-btn" 
            onClick={() => onGenreClick(cat.slug)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
        <button className="more-genres-btn" onClick={handleMoreGenres}>
          장르 더보기
        </button>
      </div>
    </section>
  );
}

/* ---------------- 메인 컴포넌트 ---------------- */
export default function Main() {
  const navigate = useNavigate();
  const goGenre = (slug) => navigate(`/genre?category=${slug}`);

  // 검색 모달 제어 (주석처리)
  // const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ✅ 날짜 선택 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedKey = fmt(selectedDate);

  // API 데이터 상태
  const [plays, setPlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로딩
  useEffect(() => {
    const fetchPlays = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const playsData = await playAPI.getPlays();
        setPlays(playsData);
      } catch (err) {
        console.error('Failed to fetch plays:', err);
        setError(err.message || '연극 데이터를 불러오는데 실패했습니다.');
        setPlays([]); // 빈 배열로 설정
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlays();
  }, []);

  // ✅ 선택 날짜에 속하는 이벤트만 필터 (현재는 plays 데이터에 날짜 정보가 없으므로 빈 배열)
  const eventsOfDay = useMemo(() => [], [selectedKey]);

  // ✅ 달력에 표시할 마커 (현재는 plays 데이터에 날짜 정보가 없으므로 빈 Set)
  const markers = useMemo(() => new Set(), []);

  return (
    <div className="main-page">
      {/* 커튼 배경 요소들 */}
      <div className="top-curtain"></div>
      <div className="curtain-decoration"></div>
      
      <Topnav variant="home" />
      {/* {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />} */}

      {/* <div className="spacer" /> */}
      <main className="main-container">
        <section className="hero-block">
          <Hero plays={plays} isLoading={isLoading} error={error} isLoggedIn={false} />

          {/* 검색 및 장르 필터 */}
          <SearchAndGenre 
            onSearchClick={() => {}} 
            onGenreClick={goGenre} 
          />
        </section>
        
        {/* 추천 공연 슬라이드 */}
        <RecommendedShows plays={plays} isLoading={isLoading} error={error} />

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

