import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Topnav.css';
import SearchModal from './SearchModal';

// 메뉴 아이콘 컴포넌트 (SVG fallback 포함)
const MenuIcon = ({ iconPath, fallbackEmoji, alt }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <span className="menu-icon-emoji">{fallbackEmoji}</span>;
  }

  return (
    <img 
      src={iconPath} 
      alt={alt}
      className="menu-icon-svg"
      onError={() => setImageError(true)}
    />
  );
};

export default function Topnav({ variant = "default" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isDeviceLoggedIn, setIsDeviceLoggedIn] = useState(false);
  const [isDeviceInputExpanded, setIsDeviceInputExpanded] = useState(false);
  const [deviceInputValue, setDeviceInputValue] = useState('');

  // Main.jsx인지 확인 (홈페이지)
  const isHome = location.pathname === '/';

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const savedDeviceId = localStorage.getItem('deviceId');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        } catch (error) {
          console.error('사용자 정보 파싱 오류:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }

      // 기기번호 상태 확인
      if (savedDeviceId) {
        setDeviceId(savedDeviceId);
        setIsDeviceLoggedIn(true);
      } else {
        setDeviceId(null);
        setIsDeviceLoggedIn(false);
      }
    };

    checkLoginStatus();

    // localStorage 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트가 마운트될 때마다 상태 확인
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const goHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // localStorage에서 토큰과 사용자 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 상태 업데이트
    setIsLoggedIn(false);
    setUser(null);
    
    // 메인 페이지로 리다이렉트
    navigate('/');
  };

  const handleMyPage = () => {
    navigate('/user-selection');
  };

  // 기기번호 처리 함수
  const handleDeviceSubmit = async (deviceNumber) => {
    if (!deviceNumber) {
      // 로그아웃 처리
      setIsDeviceLoggedIn(false);
      setDeviceId(null);
      setIsDeviceInputExpanded(false);
      setDeviceInputValue('');
      localStorage.removeItem('deviceId');
      return;
    }

    try {
      // 기기번호 검증 (시연용 - 12345만 허용)
      if (deviceNumber !== '12345') {
        throw new Error('올바르지 않은 기기번호입니다');
      }

      // 로그인 성공 처리
      setIsDeviceLoggedIn(true);
      setDeviceId(deviceNumber);
      setIsDeviceInputExpanded(false);
      setDeviceInputValue('');
      localStorage.setItem('deviceId', deviceNumber);
      
      console.log('기기번호 로그인 성공:', deviceNumber);
    } catch (err) {
      throw err;
    }
  };

  // 기기입력 버튼 클릭 핸들러
  const handleDeviceInputClick = () => {
    setIsDeviceInputExpanded(true);
  };

  // 기기번호 입력 핸들러
  const handleDeviceInputChange = (e) => {
    setDeviceInputValue(e.target.value);
  };

  // 기기번호 입력 완료 핸들러
  const handleDeviceInputSubmit = (e) => {
    e.preventDefault();
    if (deviceInputValue.trim()) {
      handleDeviceSubmit(deviceInputValue.trim());
    }
  };

  // ESC 키로 입력 취소
  const handleDeviceInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDeviceInputExpanded(false);
      setDeviceInputValue('');
    }
  };

  return (
    <>
      <header className={`topnav ${isHome ? 'is-home' : ''}`}>
        {/* 커튼 배경 요소들 */}
        <div className="left-curtain"></div>
        <div className="right-curtain"></div>
        
        {/* 왼쪽 영역 */}
        <div className="topnav-left">
          <div 
            className={`menu-toggle ${isSideMenuOpen ? 'active' : ''}`}
            onClick={toggleSideMenu}
            role="button"
            tabIndex={0}
            aria-label="메뉴 열기/닫기"
            onKeyDown={(e) => e.key === 'Enter' && toggleSideMenu()}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
          
          {/* Main.jsx가 아닌 경우에만 검색 아이콘 표시 */}
          {!isHome && (
            <span
              className="nav-search-icon"
              role="button"
              tabIndex={0}
              aria-label="검색"
              onClick={openSearchModal}
              onKeyDown={(e) => e.key === 'Enter' && openSearchModal()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          )}
        </div>

        {/* 중앙 영역 - Main.jsx가 아닌 경우에만 로고 표시 */}
        {!isHome && (
          <div 
            className="logo-wrapper"
            onClick={goHome}
            role="button"
            tabIndex={0}
            aria-label="홈으로 이동"
            onKeyDown={(e) => e.key === 'Enter' && goHome()}
            style={{ cursor: 'pointer' }}
          >
            <h1 className="logo">FestiGuard</h1>
          </div>
        )}

        {/* 오른쪽 영역 */}
        <div className="topnav-right">
          {/* 기기입력 버튼 */}
          {isDeviceLoggedIn ? (
            <div className="device-status-compact">
              <img src="/icons/vest.png" alt="device" className="device-icon-small" />
              <span className="device-id-compact">{deviceId}</span>
              <button 
                className="device-logout-compact"
                onClick={() => handleDeviceSubmit(null)}
                title="기기 연결 해제"
              >
                ×
              </button>
            </div>
          ) : (
            <div className={`device-input-container ${isDeviceInputExpanded ? 'expanded' : ''}`}>
              {isDeviceInputExpanded ? (
                <form onSubmit={handleDeviceInputSubmit} className="device-input-form-compact">
                  <img src="/icons/vest.png" alt="device" className="device-icon-small" />
                  <input
                    type="text"
                    placeholder="기기번호를 입력하세요"
                    value={deviceInputValue}
                    onChange={handleDeviceInputChange}
                    onKeyDown={handleDeviceInputKeyDown}
                    className="device-input-field"
                    autoFocus
                  />
                  <button type="submit" className="device-submit-compact">
                    ✓
                  </button>
                  <button 
                    type="button" 
                    className="device-cancel-compact"
                    onClick={() => {
                      setIsDeviceInputExpanded(false);
                      setDeviceInputValue('');
                    }}
                  >
                    ×
                  </button>
                </form>
              ) : (
                <button 
                  className="device-input-compact"
                  onClick={handleDeviceInputClick}
                  aria-label="기기번호 입력"
                >
                  <img src="/icons/vest.png" alt="device" className="device-icon-small" />
                  기기입력
                </button>
              )}
            </div>
          )}

          {/* 로그인/로그아웃 버튼 주석처리
          {isLoggedIn ? (
            <div className="user-menu">
              <button 
                className="topnav-mypage-btn" 
                onClick={handleMyPage}
                aria-label="마이페이지"
              >
                {user?.name || '마이페이지'}
              </button>
              <button 
                className="topnav-logout-btn" 
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              className="topnav-login-btn" 
              onClick={handleLogin}
              aria-label="로그인"
            >
              로그인
            </button>
          )}
          */}
        </div>
      </header>

      {/* 사이드 메뉴 */}
      <div className={`side-menu-overlay ${isSideMenuOpen ? 'active' : ''}`} onClick={closeSideMenu}></div>
      <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h2>메뉴</h2>
          <button className="close-menu-btn" onClick={closeSideMenu}>
            <span className="close-icon">✕</span>
          </button>
        </div>
        
        <nav className="side-menu-nav">
          <ul>
            <li>
              <a href="/" onClick={closeSideMenu} className={location.pathname === '/' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/home.svg" 
                  fallbackEmoji="🏠" 
                  alt="홈"
                />
                <span className="menu-text">홈</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            {isLoggedIn ? (
              <li>
                <a href="/user-selection" onClick={closeSideMenu} className={location.pathname === '/user-selection' ? 'active' : ''}>
                  <MenuIcon 
                    iconPath="/icons/login.svg" 
                    fallbackEmoji="👤" 
                    alt="마이페이지"
                  />
                  <span className="menu-text">마이페이지</span>
                  <span className="menu-arrow">›</span>
                </a>
              </li>
            ) : (
              <li>
                <a href="/login" onClick={closeSideMenu} className={location.pathname === '/login' ? 'active' : ''}>
                  <MenuIcon 
                    iconPath="/icons/login.svg" 
                    fallbackEmoji="🔑" 
                    alt="로그인"
                  />
                  <span className="menu-text">로그인</span>
                  <span className="menu-arrow">›</span>
                </a>
              </li>
            )}
            <li>
              <a href="/genre" onClick={closeSideMenu} className={location.pathname === '/genre' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/genre.svg" 
                  fallbackEmoji="🎶" 
                  alt="전체 축제"
                />
                <span className="menu-text">전체 축제</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            <li>
              <a href="/map" onClick={closeSideMenu} className={location.pathname === '/map' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/map.svg" 
                  fallbackEmoji="🗺️" 
                  alt="지도"
                />
                <span className="menu-text">지도</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            <li>
              <a href="/biodata" onClick={closeSideMenu} className={location.pathname === '/biodata' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/biodata.svg" 
                  fallbackEmoji="💓" 
                  alt="생체데이터"
                />
                <span className="menu-text">생체데이터</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            <li>
              <a href="/test/my-test" onClick={closeSideMenu} className={location.pathname === '/test/my-test' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/test.svg" 
                  fallbackEmoji="⭐" 
                  alt="취향테스트"
                />
                <span className="menu-text">취향테스트</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            <li>
              <a href="/ai-translation" onClick={closeSideMenu} className={location.pathname === '/ai-translation' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/translation.svg" 
                  fallbackEmoji="🌐" 
                  alt="AI 번역"
                />
                <span className="menu-text">AI 번역</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
            <li>
              <a href="/community" onClick={closeSideMenu} className={location.pathname === '/community' ? 'active' : ''}>
                <MenuIcon 
                  iconPath="/icons/community.svg" 
                  fallbackEmoji="💬" 
                  alt="커뮤니티"
                />
                <span className="menu-text">커뮤니티</span>
                <span className="menu-arrow">›</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="side-menu-footer">
          <p>© 2025 FestiGuard</p>
          <p>안전한 즐거움, 스마트한 보호</p>
        </div>
      </div>

      {/* 검색 모달 */}
      {isSearchModalOpen && (
        <SearchModal onClose={closeSearchModal} />
      )}
    </>
  );
}
