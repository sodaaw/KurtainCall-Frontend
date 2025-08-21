import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './Review.css';

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const review = location.state?.review;

  // 리뷰 데이터가 없으면 기본 데이터 사용
  const defaultReview = {
    id: 'default',
    userName: 'Sample User',
    userBadge: 'KR',
    area: 'Seoul',
    activities: ['Culture', 'Food'],
    tags: ['Location', 'Recommend'],
    rating: 4,
    lang: 'ko',
    date: '2025-01-15',
    photos: [],
    content: 'This is a sample review content. Click on review cards from Genre or Community pages to see actual reviews.',
    likes: 12,
    comments: 5
  };

  const currentReview = review || defaultReview;
  const stars = '★★★★★'.slice(0, currentReview.rating) + '☆☆☆☆☆'.slice(currentReview.rating);

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleLike = () => {
    // 좋아요 기능 구현 (현재는 콘솔 로그만)
    console.log('Liked review:', currentReview.id);
  };

  const handleComment = () => {
    // 댓글 기능 구현 (현재는 콘솔 로그만)
    console.log('Comment on review:', currentReview.id);
  };

  const handleShare = () => {
    // 공유 기능 구현 (현재는 콘솔 로그만)
    console.log('Share review:', currentReview.id);
  };

  return (
    <div className="review-page">
      <Topnav />
      
      <div className="review-container">
        {/* 뒤로가기 버튼 */}
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        {/* 리뷰 헤더 */}
        <header className="review-header">
          <div className="review-user-info">
            <div className="user-avatar">
              <div className="avatar-placeholder"></div>
            </div>
            <div className="user-details">
              <div className="user-name">
                {currentReview.userName} 
                <span className="user-badge">{currentReview.userBadge}</span>
              </div>
              <div className="user-location">
                Area: {currentReview.area} | Activities: {currentReview.activities.join(', ')}
              </div>
              <div className="review-date">{currentReview.date}</div>
            </div>
          </div>
          <div className="review-rating">
            <div className="stars">{stars}</div>
            <div className="rating-text">{currentReview.rating}/5</div>
          </div>
        </header>

        {/* 리뷰 콘텐츠 */}
        <main className="review-content">
          <div className="review-photo-section">
            {currentReview.photos?.length ? (
              <img 
                src={currentReview.photos[0]} 
                alt="Review" 
                className="review-photo"
              />
            ) : (
              <div className="photo-placeholder">
                <div className="photo-icon">🖼</div>
                <div className="photo-text">No Photo</div>
              </div>
            )}
          </div>
          
          <div className="review-text-section">
            <h2 className="review-title">Review Content</h2>
            <p className="review-text">{currentReview.content}</p>
          </div>
        </main>

        {/* 리뷰 태그 */}
        <section className="review-tags">
          <h3>Tags</h3>
          <div className="tags-container">
            {currentReview.tags.map((tag, index) => (
              <span key={index} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* 리뷰 통계 */}
        <section className="review-stats">
          <div className="stat-item">
            <span className="stat-icon">♥</span>
            <span className="stat-value">{currentReview.likes}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{currentReview.comments}</span>
            <span className="stat-label">Comments</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span className="stat-value">1.2k</span>
            <span className="stat-label">Views</span>
          </div>
        </section>

        {/* 액션 버튼 */}
        <section className="review-actions">
          <button className="action-btn like-btn" onClick={handleLike}>
            <span className="btn-icon">♥</span>
            <span className="btn-text">Like</span>
          </button>
          <button className="action-btn comment-btn" onClick={handleComment}>
            <span className="btn-icon">💬</span>
            <span className="btn-text">Comment</span>
          </button>
          <button className="action-btn share-btn" onClick={handleShare}>
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Share</span>
          </button>
        </section>

        {/* 관련 리뷰 추천 */}
        <section className="related-reviews">
          <h3>Related Reviews</h3>
          <div className="related-cards">
            <div className="related-card">
              <div className="related-photo">🖼</div>
              <div className="related-content">
                <h4>Similar Experience</h4>
                <p>Another great review about this location...</p>
              </div>
            </div>
            <div className="related-card">
              <div className="related-photo">🖼</div>
              <div className="related-content">
                <h4>Local Recommendation</h4>
                <p>Must-visit place according to locals...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Review;
