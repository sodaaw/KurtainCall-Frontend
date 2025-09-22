import React, { useState, useEffect } from 'react';
import locationService from '../services/locationService';
import './RecommendedPlaces.css';

const RecommendedPlaces = ({ genre = null, limit = 6, title = "📍 근처 추천 장소" }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendedPlaces();
  }, [genre, limit]);

  const loadRecommendedPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      let recommendedPlaces = [];
      
      if (genre) {
        // 장르별 추천 장소
        recommendedPlaces = await locationService.getGenreSpecificPlaces(genre);
      } else {
        // 일반 추천 장소
        recommendedPlaces = await locationService.getRecommendedPlaces(limit);
      }

      setPlaces(recommendedPlaces);
    } catch (err) {
      console.error('추천 장소 로드 실패:', err);
      setError('추천 장소를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  };

  const getCategoryIcon = (category) => {
    if (category.includes('극장') || category.includes('공연')) return '🎭';
    if (category.includes('박물관')) return '🏛️';
    if (category.includes('미술관') || category.includes('갤러리')) return '🖼️';
    if (category.includes('전시')) return '🎨';
    if (category.includes('카페')) return '☕';
    if (category.includes('음식')) return '🍽️';
    if (category.includes('공원')) return '🌳';
    if (category.includes('쇼핑')) return '🛍️';
    if (category.includes('문화')) return '🎪';
    if (category.includes('관광')) return '🗺️';
    if (category.includes('아트')) return '🎨';
    if (category.includes('센터')) return '🏢';
    return '📍';
  };

  if (loading) {
    return (
      <section className="recommended-places-section">
        <h3 className="places-section-title">{title}</h3>
        <div className="places-loading">
          <div className="loading-spinner"></div>
          <p>근처 장소를 찾고 있어요...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recommended-places-section">
        <h3 className="places-section-title">{title}</h3>
        <div className="places-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={loadRecommendedPlaces} className="retry-btn">
            다시 시도
          </button>
        </div>
      </section>
    );
  }

  if (places.length === 0) {
    return (
      <section className="recommended-places-section">
        <h3 className="places-section-title">{title}</h3>
        <div className="places-empty">
          <div className="empty-icon">📍</div>
          <p>근처에 추천할 장소가 없어요.</p>
        </div>
      </section>
    );
  }

  const handlePlaceClick = (place) => {
    if (place.url) {
      window.open(place.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="recommended-places-section">
      <h3 className="places-section-title">{title}</h3>
      <div className="places-grid">
        {places.map((place) => (
          <div 
            key={place.id} 
            className="place-card"
            onClick={() => handlePlaceClick(place)}
          >
            <div className="place-emoji-container">
              <div className="place-emoji">
                {getCategoryIcon(place.category)}
              </div>
            </div>
            
            <div className="place-info">
              <h4 className="place-name">{place.name}</h4>
              <p className="place-address">{place.address}</p>
              
              <div className="place-meta">
                <div className="place-rating">
                  {place.rating > 0 && (
                    <>
                      <span className="rating-stars">⭐</span>
                      <span className="rating-value">{place.rating.toFixed(1)}</span>
                      <span className="review-count">({place.reviewCount})</span>
                    </>
                  )}
                </div>
                <div className="place-distance">
                  <span className="distance-icon">🚶‍♂️</span>
                  <span className="distance-value">{formatDistance(place.distance)}</span>
                </div>
              </div>
              
              <div className="place-category">
                <span className="category-text">{place.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedPlaces;
