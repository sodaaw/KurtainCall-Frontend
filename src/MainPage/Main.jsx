// src/MainPage/Main.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from "../components/Topnav";
import DeviceInput from "../components/DeviceInput";
import BiometricAnalysis from "../components/BiometricAnalysis";
import BiometricSummary from "../components/BiometricSummary";
// import SearchModal from "../components/SearchModal";
import EventCalendar from "./EventCalendar"; // ✅ 분리한 캘린더
import EventPanel from "./EventPanel";       // ✅ 분리한 우측 패널
import RecommendedPlaces from "../components/RecommendedPlaces"; // ✅ 추천 장소 컴포넌트
import { playAPI, testAPIConnection, sensorAPI } from "../services/api";
import { getBiometricPlaceRecommendation } from "../utils/biometricAnalysis";
// import { festivals } from "../data/festivals"; // ✅ 연극 데이터 import - 제거됨
import "./Main.css";

// 카테고리 버튼 데이터
const DEFAULT_CATS = [
  { 
    label: "코미디", 
    slug: "comedy", 
    //icon: "😄",
    description: "웃음과 유머"
  },
  { 
    label: "뮤지컬", 
    slug: "musical", 
    //icon: "🎵",
    description: "음악과 노래"
  },
];

/* 유틸 */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inRange = (day, start, end) => day >= start && day <= end;

// ✅ 연극 날짜 파싱 함수
const parseFestivalDate = (dateString) => {
  // "2025.05.14(수)~2025.05.16(금)" 형태를 파싱
  const match = dateString.match(/(\d{4})\.(\d{2})\.(\d{2})\([^)]+\)~(\d{4})\.(\d{2})\.(\d{2})\([^)]+\)/);
  if (match) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
    return {
      start: new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay)),
      end: new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay))
    };
  }
  return null;
};

// ✅ 날짜가 연극 기간에 포함되는지 확인
const isDateInFestival = (date, festival) => {
  const festivalDates = parseFestivalDate(festival.date);
  if (!festivalDates) return false;
  
  const dateStr = fmt(date);
  const startStr = fmt(festivalDates.start);
  const endStr = fmt(festivalDates.end);
  
  return dateStr >= startStr && dateStr <= endStr;
};

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
        <h1>CulturaLink</h1>
        <p className="tagline">당신 곁의 문화, 지금 함께하세요</p>
        <div className="loading-text">
          <p>데이터를 불러오는 중...</p>
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="hero">
        <h1>CulturaLink</h1>
        <p className="tagline">당신 곁의 문화, 지금 함께하세요</p>
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
        <h1>CulturaLink</h1>
        <p className="tagline">당신 곁의 문화, 지금 함께하세요</p>
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
        <h1>CulturaLink</h1>
        <p className="tagline">당신 곁의 문화, 지금 함께하세요</p>
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
      <h1>CulturaLink</h1>

      {/* 태그라인 */}
      <p className="tagline">당신 곁의 문화, 지금 함께하세요</p>
    </header>
  );
}

/* ---------------- 추천 공연 슬라이드 ---------------- */
function RecommendedShows({ plays, isLoading, error }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const total = plays?.length || 0;

  const handlePosterClick = (play) => {
    // 축제 상세페이지로 이동
    navigate(`/festival/${play.id}`);
  };

  useEffect(() => {
    if (total <= 3) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setIsTransitioning(false);
    }, 800);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
      setIsTransitioning(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <section className="recommended-section">
        <div className="loading-text">
          <p>공연 정보를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error || !plays || plays.length === 0) {
    return (
      <section className="recommended-section">
        <div className="no-data">
          <div className="no-data-icon">🎭</div>
          <p className="no-data-title">공연 정보를 불러올 수 없습니다</p>
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
            <div key={play.id || `show-${index}`} className="show-card">
              <div 
                className="show-link"
                onClick={() => handlePosterClick(play)}
                style={{ cursor: 'pointer' }}
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
                    onLoad={() => console.log(`✅ 이미지 로드 성공: ${play.title}`, play.posterUrl)}
                    onError={(e) => console.error(`❌ 이미지 로드 실패: ${play.title}`, play.posterUrl, e)}
                  />
                </div>
              </div>
              {/* <div className="show-title">{play.title}</div>
              {play.location?.address && (
                <div className="show-location">{play.location.address}</div>
              )} */}
              <div className="show-meta">
                <div className="show-title">{play.title}</div>
                {play.university && (
                  <div className="show-university">{play.university}</div>
                )}
                {play.date && (
                  <div className="show-date">{play.date}</div>
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

  // const handleMoreGenres = () => {
  //   navigate('/genre');
  // };

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
          <input 
            type="text" 
            placeholder="문화시설, 장소 등을 검색해보세요." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">
            <svg 
              className="search-icon-svg"  
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </div>

      {/* 장르 필터 - 제거됨 */}
      {/* <div className="genre-filters">
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
      </div> */}
    </section>
  );
}

/* ---------------- 메인 컴포넌트 ---------------- */
export default function Main() {
  const navigate = useNavigate();
  const goGenre = (slug) => navigate(`/genre?category=${slug}`);

  // 검색 모달 제어 (주석처리)
  // const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ✅ 날짜 선택 상태 (홈화면 진입 시 2025년 5월로 초기화)
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 15)); // 2025년 5월 15일
  const selectedKey = fmt(selectedDate);

  // API 데이터 상태
  const [plays, setPlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 생체데이터 관련 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [biometricRecommendation, setBiometricRecommendation] = useState(null);
  const [showBiometricAnalysis, setShowBiometricAnalysis] = useState(false);
  const [isRefreshingBio, setIsRefreshingBio] = useState(false);

  // 카테고리별 이모티콘 반환 함수
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cafe':
        return '☕';
      case 'theater':
        return '🎭';
      case 'museum':
        return '🏛️';
      case 'gallery':
        return '🖼️';
      case 'exhibition':
        return '🎨';
      case 'concert':
        return '🎵';
      default:
        return '📍';
    }
  };

  // localStorage에서 생체데이터 상태 복원
  useEffect(() => {
    const loadPersistedBiometricData = () => {
      try {
        const savedDeviceId = localStorage.getItem('biometric_device_id');
        const savedBiometricData = localStorage.getItem('biometric_data');
        const savedBiometricRecommendation = localStorage.getItem('biometric_recommendation');
        const savedIsLoggedIn = localStorage.getItem('biometric_is_logged_in');

        console.log('🔍 localStorage 체크:', {
          savedDeviceId,
          savedBiometricData: savedBiometricData ? '있음' : '없음',
          savedBiometricRecommendation: savedBiometricRecommendation ? '있음' : '없음',
          savedIsLoggedIn
        });

        // 로그인 상태이거나 생체데이터가 있으면 복원
        if ((savedIsLoggedIn === 'true' || savedDeviceId) && savedBiometricData) {
          console.log('🔄 저장된 생체데이터 상태 복원 중...');
          
          setDeviceId(savedDeviceId);
          setBiometricData(JSON.parse(savedBiometricData));
          setBiometricRecommendation(JSON.parse(savedBiometricRecommendation));
          setIsLoggedIn(true);
          setShowBiometricAnalysis(true);
          
          console.log('✅ 생체데이터 상태 복원 완료:', {
            deviceId: savedDeviceId,
            biometricData: JSON.parse(savedBiometricData),
            recommendation: JSON.parse(savedBiometricRecommendation)
          });
        } else {
          console.log('❌ 생체데이터 복원 조건 미충족');
        }
      } catch (error) {
        console.error('❌ 저장된 생체데이터 복원 실패:', error);
        // localStorage 데이터가 손상된 경우 클리어
        localStorage.removeItem('biometric_device_id');
        localStorage.removeItem('biometric_data');
        localStorage.removeItem('biometric_recommendation');
        localStorage.removeItem('biometric_is_logged_in');
      }
    };

    loadPersistedBiometricData();
  }, []);

  // 기기번호 입력 처리 함수
  const handleDeviceSubmit = async (deviceNumber) => {
    if (!deviceNumber) {
      // 로그아웃 - localStorage 클리어
      console.log('🚪 로그아웃 처리 중...');
      setIsLoggedIn(false);
      setDeviceId(null);
      setBiometricData(null);
      setBiometricRecommendation(null);
      setShowBiometricAnalysis(false);
      
      // localStorage에서 생체데이터 관련 데이터 모두 제거
      localStorage.removeItem('biometric_device_id');
      localStorage.removeItem('biometric_data');
      localStorage.removeItem('biometric_recommendation');
      localStorage.removeItem('biometric_is_logged_in');
      
      console.log('✅ 로그아웃 완료 - localStorage 클리어됨');
      return;
    }

    try {
      // 기기번호 검증
      console.log('기기번호 입력:', deviceNumber);
      
      // 실제 센서 API에서 최신 데이터 조회
      console.log('🌐 최신 센서 분석 결과 조회 시작...');
      const data = await sensorAPI.getLatestSensorResult();
      
      console.log('📡 API 응답 데이터:', data);
      
      // API 데이터를 기존 형식으로 변환
      const transformedData = {
        id: data._id || data.id,
        timestamp: data.timestamp || data.createdAt,
        status: data.status,
        user_status: data.user_status,
        led_signal: data.led_signal,
        analysis: {
          avg_hr_bpm: data.temperature || 0, // API에서 temperature 필드 사용
          avg_spo2_pct: data.humidity || 0,   // API에서 humidity 필드 사용
          avg_temperature_c: data.temperature || 0,
          avg_humidity_pct: data.humidity || 0,
        },
      };
      
      console.log('✅ 변환된 생체데이터:', transformedData);
      
      // 생체데이터 분석 및 추천 생성
      const recommendation = getBiometricPlaceRecommendation(transformedData);
      
      // 상태 업데이트
      setDeviceId(deviceNumber);
      setBiometricData(transformedData);
      setBiometricRecommendation(recommendation);
      setIsLoggedIn(true);
      setShowBiometricAnalysis(true);
      
      // localStorage에 생체데이터 상태 저장
      localStorage.setItem('biometric_device_id', deviceNumber);
      localStorage.setItem('biometric_data', JSON.stringify(transformedData));
      localStorage.setItem('biometric_recommendation', JSON.stringify(recommendation));
      localStorage.setItem('biometric_is_logged_in', 'true');
      
      console.log('🧠 생체데이터 기반 추천:', recommendation);
      console.log('💾 생체데이터 상태가 localStorage에 저장되었습니다.');
      console.log('🔍 저장된 localStorage 확인:', {
        deviceId: localStorage.getItem('biometric_device_id'),
        isLoggedIn: localStorage.getItem('biometric_is_logged_in'),
        hasBiometricData: !!localStorage.getItem('biometric_data')
      });
      
    } catch (error) {
      console.error('❌ 센서 데이터 로드 실패:', error);
      throw error;
    }
  };

  // 홈에서 즉시 새로고침: 최신 센서 결과를 불러와 상태와 추천 갱신
  const refreshBiometricNow = async () => {
    try {
      setIsRefreshingBio(true);
      const data = await sensorAPI.getLatestSensorResult();
      const transformedData = {
        id: data._id || data.id,
        timestamp: data.timestamp || data.createdAt,
        status: data.status,
        user_status: data.user_status,
        led_signal: data.led_signal,
        analysis: {
          avg_hr_bpm: data.temperature || 0,
          avg_spo2_pct: data.humidity || 0,
          avg_temperature_c: data.temperature || 0,
          avg_humidity_pct: data.humidity || 0,
        },
      };
      const recommendation = getBiometricPlaceRecommendation(transformedData);
      setBiometricData(transformedData);
      setBiometricRecommendation(recommendation);
      setShowBiometricAnalysis(true);
      // 로그인 플래그가 없으면 켜줌 (게스트도 즉시 확인 가능하게)
      if (!isLoggedIn) setIsLoggedIn(true);
      // localStorage에 즉시 반영
      if (deviceId) localStorage.setItem('biometric_device_id', deviceId);
      localStorage.setItem('biometric_data', JSON.stringify(transformedData));
      localStorage.setItem('biometric_recommendation', JSON.stringify(recommendation));
      localStorage.setItem('biometric_is_logged_in', 'true');
    } catch (e) {
      console.error('❌ 생체데이터 새로고침 실패:', e);
    } finally {
      setIsRefreshingBio(false);
    }
  };


  // 데이터 로딩 - 연극 API 사용
  useEffect(() => {
    const loadPlays = async () => {
      try {
        console.log('🚀 Main 컴포넌트: 연극 데이터 로딩 시작');
        setIsLoading(true);
        setError(null);

        // API 연결 상태 확인
        console.log('🔗 API 기본 URL 확인:', 'https://re-local.onrender.com/api');
        console.log('📡 API 엔드포인트: /play');
        
        // API 연결 테스트 실행
        console.log('🧪 API 연결 테스트 실행 중...');
        const connectionTest = await testAPIConnection();
        console.log('🧪 API 연결 테스트 결과:', connectionTest);
        
        if (!connectionTest.success) {
          throw new Error(`API 연결 실패: ${connectionTest.error}`);
        }
        
        // API에서 연극 데이터 가져오기
        const apiPlays = await playAPI.getPlays();
        console.log('✅ Main 컴포넌트: API에서 받은 연극 데이터:', apiPlays);
        console.log(`📊 받은 데이터 개수: ${apiPlays?.length || 0}개`);
        
        // API 데이터를 plays 형식으로 변환
        const formattedPlays = apiPlays.map((play, index) => ({
          id: play.id || `play-${index}`,
          title: play.title,
          posterUrl: play.posterUrl || play.image,
          location: typeof play.location === 'string' 
            ? play.location 
            : play.location?.address || play.location,
          detailUrl: play.detailUrl,
          description: play.description,
          university: play.university,
          date: play.date,
          performers: play.performers,
          category: play.category
        }));
        
        console.log('✅ Main 컴포넌트: 데이터 변환 완료');
        console.log('📊 변환된 연극 데이터:', formattedPlays);
        
        // 이미지 URL 검증
        formattedPlays.forEach((play, index) => {
          console.log(`🖼️ 연극 ${index + 1}: ${play.title}`);
          console.log(`   📸 포스터 URL: ${play.posterUrl}`);
          console.log(`   🔗 URL 유효성: ${play.posterUrl ? '있음' : '없음'}`);
        });
        
        setPlays(formattedPlays);
        console.log('🎉 Main 컴포넌트: 연극 데이터 로딩 성공');
      } catch (err) {
        console.error('❌ Main 컴포넌트: API 로딩 실패');
        console.error('🔍 에러 상세:', {
          name: err.name,
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        
        setError(err.message || '공연 데이터를 불러오는데 실패했습니다.');
        
        // API 실패 시 빈 배열로 설정
        console.log('⚠️ API 실패, 빈 배열로 설정');
        setPlays([]);
      } finally {
        console.log('🏁 Main 컴포넌트: 로딩 완료');
        setIsLoading(false);
      }
    };

    loadPlays();
  }, []);

  // 렌더링 후 DOM 확인
  useEffect(() => {
    if (plays.length > 0) {
      console.log('🔍 DOM 렌더링 확인:');
      console.log(`📊 plays 배열 길이: ${plays.length}`);
      
      // DOM에서 이미지 요소들 찾기
      const images = document.querySelectorAll('.play-image, .poster-img');
      console.log(`🖼️ DOM에서 찾은 이미지 요소 개수: ${images.length}`);
      
      images.forEach((img, index) => {
        console.log(`🖼️ 이미지 ${index + 1}:`, {
          src: img.src,
          alt: img.alt,
          className: img.className,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        });
      });
    }
  }, [plays]);

  // ✅ 선택 날짜에 속하는 연극 이벤트 필터 (festivals 제거로 빈 배열)
  const eventsOfDay = useMemo(() => {
    return [];
  }, [selectedKey]);

  // ✅ 달력에 표시할 마커 (festivals 제거로 빈 Set)
  const markers = useMemo(() => {
    return new Set();
  }, []);

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
          <Hero plays={plays} isLoading={isLoading} error={error} isLoggedIn={isLoggedIn} />

          {/* 기기번호 입력 섹션 */}
          <div className="device-section">
            <DeviceInput 
              onDeviceSubmit={handleDeviceSubmit}
              isLoggedIn={isLoggedIn}
              deviceId={deviceId}
            />
          </div>

          {/* 생체데이터 요약 */}
          {showBiometricAnalysis && biometricData && biometricRecommendation && (
            <div className="biometric-section">
              <BiometricSummary 
                data={biometricData} 
                recommendation={biometricRecommendation}
                onRefresh={refreshBiometricNow}
                refreshing={isRefreshingBio}
              />
            </div>
          )}

          {/* 검색 및 장르 필터 - 제거됨 */}
          {/* <SearchAndGenre 
            onSearchClick={() => {}} 
            onGenreClick={goGenre} 
          /> */}
        </section>
        
        {/* ✅ 생체데이터 기반 추천 장소 섹션 */}
        {biometricRecommendation && biometricRecommendation.categories.length > 0 ? (
          <RecommendedPlaces 
            title={biometricRecommendation.message}
            genre={biometricRecommendation.categories[0]} // 첫 번째 카테고리 사용
            limit={4}
          />
        ) : (
          <RecommendedPlaces 
            title="📍 내 주변 문화시설" 
            limit={4}
          />
        )}

        {/* ✅ 근처 연극 정보 섹션 - 로그인하지 않은 경우에만 표시 */}
        {!isLoggedIn && (
          <section className="nearby-plays-section">
            <h3 className="plays-section-title">🎭 연극 정보</h3>
            <div className="plays-grid">
              {isLoading ? (
                <div className="plays-loading">
                  <div className="loading-spinner"></div>
                  <p>연극 정보를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="plays-error">
                  <div className="error-icon">⚠️</div>
                  <p>연극 정보를 불러올 수 없습니다.</p>
                </div>
              ) : plays && plays.length > 0 ? (
                plays.slice(0, 6).map((play, index) => (
                  <div key={play.id || `play-${index}`} className="play-card">
                    <div className="play-image-container">
                      {play.posterUrl ? (
                        <img
                          src={play.posterUrl}
                          alt={play.title}
                          className="play-image"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onLoad={() => console.log(`✅ 연극 이미지 로드 성공: ${play.title}`, play.posterUrl)}
                          onError={(e) => console.error(`❌ 연극 이미지 로드 실패: ${play.title}`, play.posterUrl, e)}
                        />
                      ) : (
                        <div className="play-emoji-container">
                          <div className="play-emoji">🎭</div>
                        </div>
                      )}
                    </div>
                    <div className="play-info">
                      <h4 className="play-title">{play.title}</h4>
                      {play.location && (
                        <p className="play-location">
                          {typeof play.location === 'string' 
                            ? play.location 
                            : play.location.address || play.location}
                        </p>
                      )}
                      {play.date && (
                        <p className="play-date">{play.date}</p>
                      )}
                      {play.university && (
                        <p className="play-university">{play.university}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="plays-empty">
                  <div className="empty-icon">🎭</div>
                  <p>근처에 연극 정보가 없어요.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ✅ 좌: 캘린더 / 우: 이벤트 패널 */}
        {/* <section className="schedule">
          <EventCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            markers={markers}
          />
          <EventPanel
            date={selectedDate}
            events={eventsOfDay}
          />
        </section> */}
      </main>
    </div>
  );
}

