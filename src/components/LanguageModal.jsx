import React from "react";
import "./LanguageModal.css";

const LanguageModal = ({ onClose, currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageSelect = (languageCode) => {
    console.log(`Selected language: ${languageCode}`);
    onLanguageChange(languageCode); // 부모 컴포넌트에 언어 변경 알림
  };

  const handleOverlayClick = (e) => {
    // 오버레이를 클릭했을 때만 닫기 (모달 내부 클릭은 무시)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 현재 언어 정보 가져오기
  const getCurrentLanguageInfo = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang || languages[0];
  };

  const currentLangInfo = getCurrentLanguageInfo();

  return (
    <div className="language-modal-overlay" onClick={handleOverlayClick}>
      <div className="language-modal">
        {/* 커튼 장식 요소 */}
        <div className="curtain-decoration"></div>
        
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {/* 제목 */}
        <div className="modal-header">
          <h2>🌐 Language Change</h2>
          <p>언어를 선택하세요 / Select your preferred language</p>
        </div>

        {/* 언어 선택 목록 */}
        <div className="language-list">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'selected' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>

        {/* 현재 언어 표시 */}
        <div className="current-language">
          <span>Current: {currentLangInfo.flag} {currentLangInfo.name}</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
