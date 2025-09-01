import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topnav.css';
import SearchModal from './SearchModal';
import LanguageModal from './LanguageModal';

export default function Topnav() {
  const navigate = useNavigate();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ko'); // 언어 상태를 Topnav에서 관리
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode); // 언어 변경 시 Topnav의 상태 업데이트
    setIsLanguageModalOpen(false); // 모달 닫기
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
      <header className="topnav">
        {/* 커튼 배경 요소들 */}
        <div className="left-curtain"></div>
        <div className="right-curtain"></div>
        
        <div 
          className={`menu-toggle ${isSideMenuOpen ? 'active' : ''}`}
          onClick={toggleSideMenu}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
          onKeyDown={(e) => e.key === 'Enter' && toggleSideMenu()}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* 로고 + 태그라인 */}
        <div 
          className="logo-wrapper"
          onClick={goHome}
          role="button"
          tabIndex={0}
          aria-label="Go to home page"
          onKeyDown={(e) => e.key === 'Enter' && goHome()}
          style={{ cursor: 'pointer' }}
        >
          <h1 className="logo">KurtainCall</h1>
          <p className="tagline">Your Gateway to Korea's Hidden Stages</p>
        </div>

        <div className="topnav-right">
          <span
            className="search-icon"
            role="button"
            tabIndex={0}
            aria-label="search"
            onClick={openSearchModal}
            onKeyDown={(e) => e.key === 'Enter' && openSearchModal()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
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
          <button 
            className="login-btn" 
            onClick={() => navigate('/login')}
            aria-label="Login"
          >
            로그인
          </button>
        </div>
      </header>

      {/* 사이드 메뉴 */}
      <div className={`side-menu-overlay ${isSideMenuOpen ? 'active' : ''}`} onClick={closeSideMenu}></div>
      <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>
          <button className="close-menu-btn" onClick={closeSideMenu}>
            <span className="close-icon">✕</span>
          </button>
        </div>
        
        <nav className="side-menu-nav">
          <ul>
            <li><a href="/" onClick={closeSideMenu}>Home</a></li>
            <li><a href="/genre" onClick={closeSideMenu}>Genre</a></li>
            <li><a href="/community" onClick={closeSideMenu}>Community</a></li>
            <li><a href="/map" onClick={closeSideMenu}>Map</a></li>
            <li><a href="/test/my-test" onClick={closeSideMenu}>Test</a></li>
            <li><a href="/ai-translation" onClick={closeSideMenu}>AI Translation</a></li>
            <li><a href="/login" onClick={closeSideMenu}>Login</a></li>
            <li><a href="/signup" onClick={closeSideMenu}>Sign Up</a></li>
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

      {/* 언어 변경 모달 */}
      {isLanguageModalOpen && (
        <LanguageModal 
          onClose={() => setIsLanguageModalOpen(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </>
  );
}
