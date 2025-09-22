import React, { useState } from 'react';
import CrawledImageDemo from './CrawledImageDemo';
import CrawledImageIntegration from './CrawledImageIntegration';
import CrawledImageExample from './CrawledImageExample';
import './CrawledImageShowcase.css';

const CrawledImageShowcase = () => {
  const [activeTab, setActiveTab] = useState('demo');

  const tabs = [
    { id: 'demo', label: '🖼️ 기본 데모', component: CrawledImageDemo },
    { id: 'integration', label: '🔗 통합 예제', component: CrawledImageIntegration },
    { id: 'example', label: '⚙️ 상세 예제', component: CrawledImageExample }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="crawled-image-showcase">
      <div className="showcase-header">
        <h1>🕷️ 크롤링 이미지 활용 가이드</h1>
        <p>카카오맵에서 크롤링한 이미지를 React 앱에서 활용하는 방법을 알아보세요</p>
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      <div className="showcase-footer">
        <div className="footer-section">
          <h3>📋 주요 기능</h3>
          <ul>
            <li>✅ 크롤링된 이미지 URL 디코딩</li>
            <li>✅ 이미지 유효성 검증</li>
            <li>✅ PhotoService와 통합</li>
            <li>✅ 우선순위 기반 이미지 선택</li>
            <li>✅ 캐싱 및 성능 최적화</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>🛠️ 사용된 기술</h3>
          <ul>
            <li>React Hooks (useState, useEffect)</li>
            <li>URL 디코딩 및 파싱</li>
            <li>이미지 유효성 검증</li>
            <li>비동기 이미지 로딩</li>
            <li>CSS Grid & Flexbox</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>📚 다음 단계</h3>
          <ul>
            <li>실제 크롤링 API 연동</li>
            <li>이미지 최적화 및 압축</li>
            <li>에러 핸들링 강화</li>
            <li>성능 모니터링</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CrawledImageShowcase;

