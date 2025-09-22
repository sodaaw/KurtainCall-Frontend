import React, { useState } from 'react';
import CrawledImageUsage from '../components/CrawledImageUsage';
import CrawledImageDemo from '../components/CrawledImageDemo';
import CrawledImageIntegration from '../components/CrawledImageIntegration';
import CrawledImageExample from '../components/CrawledImageExample';
import './CrawledImagePage.css';

const CrawledImagePage = () => {
  const [activeSection, setActiveSection] = useState('usage');

  const sections = [
    { id: 'usage', label: '📖 사용법', component: CrawledImageUsage },
    { id: 'demo', label: '🖼️ 기본 데모', component: CrawledImageDemo },
    { id: 'integration', label: '🔗 통합 예제', component: CrawledImageIntegration },
    { id: 'example', label: '⚙️ 상세 예제', component: CrawledImageExample }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="crawled-image-page">
      <div className="page-header">
        <h1>🕷️ 크롤링 이미지 활용 가이드</h1>
        <p>카카오맵에서 크롤링한 이미지를 React 앱에서 활용하는 완벽한 가이드</p>
      </div>

      <div className="section-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="section-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      <div className="page-footer">
        <div className="footer-content">
          <h3>🎯 핵심 기능</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <h4>URL 디코딩</h4>
              <p>크롤링된 이미지 URL에서 실제 이미지 URL 추출</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✅</div>
              <h4>유효성 검증</h4>
              <p>이미지 URL의 유효성을 실시간으로 검증</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <h4>서비스 통합</h4>
              <p>PhotoService와 완벽하게 통합된 이미지 관리</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h4>성능 최적화</h4>
              <p>캐싱과 우선순위 기반 이미지 선택</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrawledImagePage;

