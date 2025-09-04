import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Topnav.css';
import SearchModal from './SearchModal';

export default function Topnav({ variant = "default" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Main.jsx인지 확인 (홈페이지)
  const isHome = location.pathname === '/';
  
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
              className="search-icon"
              role="button"
              tabIndex={0}
              aria-label="검색"
              onClick={openSearchModal}
              onKeyDown={(e) => e.key === 'Enter' && openSearchModal()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <h1 className="logo">KurtainCall</h1>
          </div>
        )}

        {/* 오른쪽 영역 */}
        <div className="topnav-right">
          <button 
            className="login-btn" 
            onClick={() => navigate('/login')}
            aria-label="로그인"
          >
            로그인
          </button>
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
            <li><a href="/" onClick={closeSideMenu}>홈</a></li>
            <li><a href="/login" onClick={closeSideMenu}>로그인</a></li>
            <li><a href="/genre" onClick={closeSideMenu}>장르</a></li>
            <li><a href="/map" onClick={closeSideMenu}>지도</a></li>
            <li><a href="/biodata" onClick={closeSideMenu}>생체데이터</a></li>
            <li><a href="/test/my-test" onClick={closeSideMenu}>취향테스트</a></li>
            <li><a href="/ai-translation" onClick={closeSideMenu}>AI 번역</a></li>
            <li><a href="/community" onClick={closeSideMenu}>커뮤니티</a></li>
          </ul>
        </nav>

        <div className="side-menu-footer">
          <p>© 2025 KurtainCall</p>
          <p>Your Gateway to Korea's Hidden Stages</p>
        </div>
      </div>

      {/* 검색 모달 */}
      {isSearchModalOpen && (
        <SearchModal onClose={closeSearchModal} />
      )}
    </>
  );
}
