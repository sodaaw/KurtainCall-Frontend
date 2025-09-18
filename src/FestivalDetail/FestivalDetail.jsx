import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import Topnav from '../components/Topnav';
import './FestivalDetail.css';

const FestivalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundFestival = festivals.find(f => f.id === parseInt(id));
    if (foundFestival) {
      setFestival(foundFestival);
    }
    setLoading(false);
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="festival-detail-page">
        <Topnav variant="home" />
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-animation"></div>
            <p>연극 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="festival-detail-page">
        <Topnav variant="home" />
        <div className="error-container">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h2>연극 정보를 찾을 수 없습니다</h2>
            <p>요청하신 연극 정보가 존재하지 않습니다.</p>
            <button onClick={handleBackClick} className="back-btn">
              ← 뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="festival-detail-page">
      <Topnav variant="home" />
      
      <main className="festival-detail-container">
        {/* 연극 헤더 */}
        <header className="festival-header">
          {/* 뒤로가기 버튼 */}
          <button onClick={handleBackClick} className="back-button">
            ← 뒤로가기
          </button>
          <div className="festival-poster">
            {festival.posterUrl ? (
              <img 
                src={festival.posterUrl} 
                alt={festival.title}
                className="poster-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="poster-placeholder" 
              style={{ display: festival.posterUrl ? 'none' : 'flex' }}
            >
              <div className="placeholder-icon">🎪</div>
              <p>포스터 이미지</p>
            </div>
          </div>
          
          <div className="festival-info">
            <div className="festival-badge">
              <span className="category-badge">대학 축제</span>
              <span className={`status-badge ${festival.isActive ? 'active' : 'inactive'}`}>
                {festival.isActive ? '진행중' : '종료'}
              </span>
            </div>
            
            <h1 className="festival-title">{festival.title}</h1>
            <h2 className="festival-university">{festival.university}</h2>
            
            <div className="festival-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">{festival.date}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">{festival.location.address}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 연극 설명 */}
        <section className="festival-description">
          <h3>연극 소개</h3>
          <p>{festival.description}</p>
        </section>

        {/* 공연자 정보 */}
        <section className="performers-section">
          <h3>공연 일정</h3>
          <div className="performers-grid">
            <div className="performer-day">
              <h4>1일차</h4>
              <p>{festival.performers.day1}</p>
            </div>
            <div className="performer-day">
              <h4>2일차</h4>
              <p>{festival.performers.day2}</p>
            </div>
            <div className="performer-day">
              <h4>3일차</h4>
              <p>{festival.performers.day3}</p>
            </div>
          </div>
        </section>

        {/* 액션 버튼들 */}
        <section className="action-buttons">
          {festival.detailUrl && (
            <a 
              href={festival.detailUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn primary"
            >
              공식 페이지 보기
            </a>
          )}
          <button 
            onClick={() => navigate('/map')}
            className="action-btn secondary"
          >
            지도에서 보기
          </button>
        </section>
      </main>
    </div>
  );
};

export default FestivalDetail;
