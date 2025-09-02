import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topnav.css';
import SearchModal from './SearchModal';
// import LanguageModal from './LanguageModal'; // 언어 기능 임시 비활성화

export default function Topnav({ variant = "default "}) {
  const navigate = useNavigate();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  // const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false); // 언어 기능 임시 비활성화
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  // const [currentLanguage, setCurrentLanguage] = useState('ko'); // 언어 기능 임시 비활성화

  // 홈화면에서만 다른 디자인 적용
  const isHome = variant === "home";
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  // const handleLanguageChange = (languageCode) => {
  //   setCurrentLanguage(languageCode); // 언어 변경 시 Topnav의 상태 업데이트
  //   setIsLanguageModalOpen(false); // 모달 닫기
  // };

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

        {/* 로고 + 태그라인 (중앙) -> 홈에서 숨김 */}
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
            <p className="tagline">Your Gateway to Korea's Hidden Stages</p>
          </div>
        )}

        <div className="topnav-right">
          {/*
          <button 
            className="lang-btn" 
            onClick={() => setIsLanguageModalOpen(true)}
            aria-label="Change language"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
          */}
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
            <li><a href="/genre" onClick={closeSideMenu}>장르</a></li>
            <li><a href="/community" onClick={closeSideMenu}>커뮤니티</a></li>
            <li><a href="/map" onClick={closeSideMenu}>지도</a></li>
            <li><a href="/test/my-test" onClick={closeSideMenu}>취향테스트</a></li>
            <li><a href="/ai-translation" onClick={closeSideMenu}>AI 번역</a></li>
            <li><a href="/login" onClick={closeSideMenu}>로그인</a></li>
            <li><a href="/signup" onClick={closeSideMenu}>회원가입</a></li>
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

      {/* 언어 변경 모달 비활성화
      {isLanguageModalOpen && (
        <LanguageModal 
          onClose={() => setIsLanguageModalOpen(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      */}
    </>
  );
}
