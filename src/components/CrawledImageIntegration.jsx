import React, { useState, useEffect } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';
import './CrawledImageIntegration.css';

const CrawledImageIntegration = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 크롤링된 이미지 URL들 (실제 사용 시에는 API에서 가져옴)
  const crawledImages = {
    '국립중앙박물관': '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773',
    '서울시립미술관': '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773'
  };

  useEffect(() => {
    loadPlacesWithCrawledImages();
  }, []);

  const loadPlacesWithCrawledImages = async () => {
    setIsLoading(true);
    
    try {
      // 1. 기본 장소 데이터 생성
      const basePlaces = [
        {
          id: 'place-1',
          name: '국립중앙박물관',
          address: '서울특별시 용산구 서빙고로 137',
          category: '박물관',
          rating: 4.5,
          reviewCount: 1250,
          distance: 1.2
        },
        {
          id: 'place-2',
          name: '서울시립미술관',
          address: '서울특별시 중구 덕수궁길 61',
          category: '미술관',
          rating: 4.3,
          reviewCount: 890,
          distance: 0.8
        },
        {
          id: 'place-3',
          name: '국립현대미술관',
          address: '서울특별시 종로구 삼청로 30',
          category: '미술관',
          rating: 4.4,
          reviewCount: 1100,
          distance: 1.5
        }
      ];

      // 2. 크롤링된 이미지 처리 및 적용
      const processedPlaces = await Promise.all(
        basePlaces.map(async (place) => {
          let imageUrl = null;
          let imageSource = 'default';

          // 크롤링된 이미지가 있는 경우 처리
          if (crawledImages[place.name]) {
            try {
              const realImageUrl = ImageUtils.extractRealImageUrl(crawledImages[place.name]);
              if (realImageUrl) {
                const isValid = await ImageUtils.validateImageUrl(realImageUrl);
                if (isValid) {
                  imageUrl = realImageUrl;
                  imageSource = 'crawled';
                  
                  // PhotoService에 크롤링 이미지 추가
                  photoService.addCrawledImage(place.name, place.address, crawledImages[place.name]);
                }
              }
            } catch (error) {
              console.error('크롤링 이미지 처리 실패:', place.name, error);
            }
          }

          // 크롤링 이미지가 없는 경우 PhotoService에서 가져오기
          if (!imageUrl) {
            try {
              imageUrl = await photoService.getPlacePhoto(place.name, place.address, place.category);
              imageSource = 'service';
            } catch (error) {
              console.error('PhotoService 이미지 가져오기 실패:', place.name, error);
            }
          }

          return {
            ...place,
            imageUrl: imageUrl || '/images/fallback.jpg',
            imageSource
          };
        })
      );

      setPlaces(processedPlaces);
      console.log('✅ 크롤링 이미지 통합 완료:', processedPlaces);
    } catch (error) {
      console.error('장소 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
  };

  const getImageSourceIcon = (source) => {
    switch (source) {
      case 'crawled': return '🕷️';
      case 'service': return '🔍';
      default: return '📷';
    }
  };

  const getImageSourceText = (source) => {
    switch (source) {
      case 'crawled': return '크롤링';
      case 'service': return '서비스';
      default: return '기본';
    }
  };

  if (isLoading) {
    return (
      <div className="crawled-image-integration">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>크롤링 이미지를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crawled-image-integration">
      <h2>🖼️ 크롤링 이미지 통합 예제</h2>
      
      <div className="integration-info">
        <p>이 예제는 크롤링된 이미지를 실제 장소 데이터에 통합하는 방법을 보여줍니다.</p>
        <div className="source-legend">
          <div className="legend-item">
            <span className="legend-icon">🕷️</span>
            <span>크롤링된 이미지</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🔍</span>
            <span>PhotoService 이미지</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">📷</span>
            <span>기본 이미지</span>
          </div>
        </div>
      </div>

      <div className="places-grid">
        {places.map((place) => (
          <div 
            key={place.id} 
            className="place-card"
            onClick={() => handlePlaceClick(place)}
          >
            <div className="place-image-container">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="place-image"
                onError={(e) => {
                  e.target.src = '/images/fallback.jpg';
                }}
              />
              <div className="image-source-badge">
                {getImageSourceIcon(place.imageSource)}
                <span>{getImageSourceText(place.imageSource)}</span>
              </div>
            </div>
            
            <div className="place-info">
              <h3 className="place-name">{place.name}</h3>
              <p className="place-address">{place.address}</p>
              <div className="place-meta">
                <div className="place-rating">
                  ⭐ {place.rating} ({place.reviewCount})
                </div>
                <div className="place-distance">
                  🚶‍♂️ {place.distance}km
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div className="place-detail-modal">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setSelectedPlace(null)}
            >
              ✕
            </button>
            <h3>{selectedPlace.name}</h3>
            <div className="detail-image">
              <img src={selectedPlace.imageUrl} alt={selectedPlace.name} />
            </div>
            <div className="detail-info">
              <p><strong>주소:</strong> {selectedPlace.address}</p>
              <p><strong>카테고리:</strong> {selectedPlace.category}</p>
              <p><strong>평점:</strong> ⭐ {selectedPlace.rating} ({selectedPlace.reviewCount}개 리뷰)</p>
              <p><strong>거리:</strong> 🚶‍♂️ {selectedPlace.distance}km</p>
              <p><strong>이미지 소스:</strong> {getImageSourceIcon(selectedPlace.imageSource)} {getImageSourceText(selectedPlace.imageSource)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="code-example">
        <h3>💻 통합 코드 예제</h3>
        <pre className="code-block">
{`// 크롤링된 이미지를 장소 데이터에 통합하는 방법

// 1. 크롤링된 이미지 URL 처리
const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);
const isValid = await ImageUtils.validateImageUrl(realImageUrl);

// 2. PhotoService에 크롤링 이미지 추가
if (isValid) {
  photoService.addCrawledImage(placeName, placeAddress, crawledUrl);
}

// 3. 장소 데이터 생성 시 이미지 URL 적용
const place = {
  ...basePlaceData,
  imageUrl: realImageUrl || await photoService.getPlacePhoto(...),
  imageSource: isValid ? 'crawled' : 'service'
};`}
        </pre>
      </div>
    </div>
  );
};

export default CrawledImageIntegration;

