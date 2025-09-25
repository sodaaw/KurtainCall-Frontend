import React, { useState, useEffect } from 'react';
import locationService from '../services/locationService';
import photoService from '../services/photoService';
import KakaoImage from './KakaoImage';
import './RecommendedPlaces.css';

const RecommendedPlaces = ({ genre = null, limit = 6, title = "📍 근처 추천 장소" }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    loadRecommendedPlaces();
  }, [genre, limit]);

  const loadRecommendedPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 RecommendedPlaces: 추천 장소 로드 시작...');
      console.log('📋 파라미터:', { genre, limit });

      let recommendedPlaces = [];
      
      if (genre) {
        // 장르별 추천 장소
        console.log('🎭 장르별 추천:', genre);
        recommendedPlaces = await locationService.getGenreSpecificPlaces(genre);
      } else {
        // 일반 추천 장소
        console.log('📍 일반 추천 장소');
        recommendedPlaces = await locationService.getRecommendedPlaces(limit);
      }

      console.log('📊 받은 추천 장소:', recommendedPlaces.length, '개');
      setPlaces(recommendedPlaces);
      
      // 각 장소에 대해 카카오맵 이미지 크롤링 시도
      if (recommendedPlaces.length > 0) {
        console.log('🖼️ 이미지 크롤링 시작...');
        const imagePromises = recommendedPlaces.map(async (place) => {
          try {
            const imageUrl = await photoService.getPlacePhoto(place.name, place.address, place.category);
            return { placeId: place.id, imageUrl };
          } catch (error) {
            console.log('이미지 크롤링 실패:', place.name, error);
            return { placeId: place.id, imageUrl: null };
          }
        });
        
        const imageResults = await Promise.all(imagePromises);
        const imageMap = {};
        imageResults.forEach(({ placeId, imageUrl }) => {
          if (imageUrl) {
            imageMap[placeId] = imageUrl;
          }
        });
        
        console.log('🖼️ 이미지 크롤링 완료:', Object.keys(imageMap).length, '개 이미지');
        setImageUrls(imageMap);
      }
    } catch (err) {
      console.error('❌ 추천 장소 로드 실패:', err);
      setError('추천 장소를 불러올 수 없습니다. API 키를 확인해주세요.');
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
            {/* 카카오맵 크롤링 이미지 또는 이모지 */}
            <div className="place-image-container">
              {imageUrls[place.id] ? (
                <KakaoImage
                  imageUrl={imageUrls[place.id]}
                  width="100%"
                  height="120px"
                  alt={place.name}
                  className="place-image"
                />
              ) : (
                <div className="place-emoji-container">
                  <div className="place-emoji">
                    {getCategoryIcon(place.category)}
                  </div>
                </div>
              )}
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
