import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './EventDetail.css';

export default function EventDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, returnPath } = location.state || {};

  // 이벤트 데이터가 없으면 메인 페이지로 리다이렉트
  if (!event) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate(returnPath || '/');
  };

  const handleBookNow = () => {
    // 예매 페이지로 이동 (실제 구현 시 예매 시스템과 연동)
    window.open('https://www.interpark.com', '_blank');
  };

  return (
    <div className="event-detail-page">
      <Topnav />
      
      <div className="event-detail-container">
        <div className="event-detail-header">
          <button className="back-button" onClick={handleBack}>
            ← 뒤로 가기
          </button>
          <h1 className="event-title">{event.title}</h1>
        </div>

        <div className="event-detail-content">
          <div className="event-info-section">
            <div className="event-info-card">
              <h2>공연 정보</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">공연 기간</span>
                  <span className="info-value">{event.start} ~ {event.end}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">공연 장소</span>
                  <span className="info-value">서울시립미술관</span>
                </div>
                <div className="info-item">
                  <span className="info-label">관람 시간</span>
                  <span className="info-value">10:00 - 18:00</span>
                </div>
                <div className="info-item">
                  <span className="info-label">관람료</span>
                  <span className="info-value">무료</span>
                </div>
              </div>
            </div>

            <div className="event-description-card">
              <h2>공연 소개</h2>
              <p className="event-description">
                {event.title}은 현대 미술의 다양한 표현 방식을 통해 
                관람객들에게 새로운 경험과 영감을 제공하는 전시입니다. 
                국내외 유명 작가들의 작품을 통해 예술의 경계를 넘어선 
                창의적인 시각을 경험할 수 있습니다.
              </p>
            </div>

            <div className="event-foreign-summary-card">
              <h2>📖 For International Visitors</h2>
              <div className="foreign-summary-content">
                <div className="summary-section">
                  <h3>🎯 What is this?</h3>
                  <p>
                    {event.title} is a contemporary art exhibition that showcases 
                    diverse artistic expressions through works by renowned Korean and 
                    international artists. Experience innovative visual perspectives 
                    that transcend traditional artistic boundaries.
                  </p>
                </div>
                
                <div className="summary-section">
                  <h3>🌟 Why visit?</h3>
                  <ul className="foreign-highlights">
                    <li>Discover cutting-edge contemporary art from Asia</li>
                    <li>Experience interactive media installations</li>
                    <li>Learn about Korean art scene and culture</li>
                    <li>Free admission for all visitors</li>
                  </ul>
                </div>

                <div className="summary-section">
                  <h3>📍 Location & Access</h3>
                  <p>
                    <strong>Venue:</strong> Seoul Museum of Art<br/>
                    <strong>Address:</strong> 61 Deoksugung-gil, Jung-gu, Seoul<br/>
                    <strong>Subway:</strong> City Hall Station (Line 1, 2) Exit 1<br/>
                    <strong>Walking:</strong> 5 minutes from City Hall
                  </p>
                </div>

                <div className="summary-section">
                  <h3>💡 Tips for Visitors</h3>
                  <ul className="foreign-tips">
                    <li>Best time to visit: Weekdays 10AM-2PM (less crowded)</li>
                    <li>Photography allowed (no flash)</li>
                    <li>English audio guides available</li>
                    <li>Free guided tours on weekends</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="event-highlights-card">
              <h2>주요 특징</h2>
              <ul className="highlights-list">
                <li>국내외 유명 작가들의 작품 전시</li>
                <li>인터랙티브 미디어 아트 체험</li>
                <li>전문 큐레이터의 작품 해설</li>
                <li>가족 친화적인 전시 공간</li>
              </ul>
            </div>
          </div>

          <div className="event-action-section">
            <div className="action-card">
              <h3>예매 및 문의</h3>
              <button className="book-button" onClick={handleBookNow}>
                예매하기
              </button>
              <div className="contact-info">
                <p>📞 문의: 02-1234-5678</p>
                <p>📧 이메일: info@artmuseum.kr</p>
                <p>🌐 웹사이트: www.artmuseum.kr</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
