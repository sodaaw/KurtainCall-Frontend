import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import './userPage.css';

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    // localStorage에서 토큰과 사용자 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 로그인 페이지로 리다이렉트
    navigate('/login');
  };

  const handleEditProfile = () => {
    // 프로필 편집 페이지로 이동 (추후 구현)
    alert('프로필 편집 기능은 준비 중입니다!');
  };

  if (loading) {
    return (
      <div className="userpage-container">
        <Topnav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="userpage-container">
      <Topnav />
      
      <div className="userpage-content">
        {/* 프로필 헤더 */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name || '사용자'}</h1>
            <p className="profile-id">@{user.userid || 'user'}</p>
            <p className="profile-gender">
              {user.gender === 0 ? '남성' : user.gender === 1 ? '여성' : '미설정'}
            </p>
          </div>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            프로필 편집
          </button>
        </div>

        {/* 통계 카드들 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎭</div>
            <div className="stat-content">
              <div className="stat-number">0</div>
              <div className="stat-label">관람한 공연</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">0</div>
              <div className="stat-label">작성한 리뷰</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-number">0</div>
              <div className="stat-label">좋아요</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">0</div>
              <div className="stat-label">팔로워</div>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        <div className="menu-section">
          <h2 className="menu-title">내 활동</h2>
          <div className="menu-grid">
            <button className="menu-item" onClick={() => navigate('/community/review-recommend')}>
              <div className="menu-icon">📝</div>
              <div className="menu-content">
                <div className="menu-label">내 리뷰</div>
                <div className="menu-desc">작성한 리뷰 보기</div>
              </div>
            </button>
            
            <button className="menu-item" onClick={() => navigate('/community/travel-partner')}>
              <div className="menu-icon">🤝</div>
              <div className="menu-content">
                <div className="menu-label">동행 찾기</div>
                <div className="menu-desc">여행 동행자 찾기</div>
              </div>
            </button>
            
            <button className="menu-item" onClick={() => navigate('/community/discount-ticket')}>
              <div className="menu-icon">🎫</div>
              <div className="menu-content">
                <div className="menu-label">할인 티켓</div>
                <div className="menu-desc">특가 티켓 정보</div>
              </div>
            </button>
            
            <button className="menu-item" onClick={() => navigate('/test/my-test')}>
              <div className="menu-icon">🧪</div>
              <div className="menu-content">
                <div className="menu-label">성향 테스트</div>
                <div className="menu-desc">내 취향 분석</div>
              </div>
            </button>
          </div>
        </div>

        {/* 설정 섹션 */}
        <div className="settings-section">
          <h2 className="menu-title">설정</h2>
          <div className="settings-list">
            <button className="settings-item">
              <div className="settings-icon">🔔</div>
              <div className="settings-content">
                <div className="settings-label">알림 설정</div>
                <div className="settings-desc">푸시 알림 관리</div>
              </div>
            </button>
            
            <button className="settings-item">
              <div className="settings-icon">🌐</div>
              <div className="settings-content">
                <div className="settings-label">언어 설정</div>
                <div className="settings-desc">Korean</div>
              </div>
            </button>
            
            <button className="settings-item">
              <div className="settings-icon">🔒</div>
              <div className="settings-content">
                <div className="settings-label">개인정보 보호</div>
                <div className="settings-desc">계정 보안 관리</div>
              </div>
            </button>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
