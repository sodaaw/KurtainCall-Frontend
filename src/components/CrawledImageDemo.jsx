import React, { useState, useEffect } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';
import './CrawledImageDemo.css';

const CrawledImageDemo = () => {
  const [demoPlace, setDemoPlace] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 제공해주신 크롤링 이미지 URL
  const crawledImageUrl = '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773';

  useEffect(() => {
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    setIsLoading(true);
    
    try {
      // 1. 크롤링된 이미지 URL 처리
      const realImageUrl = ImageUtils.extractRealImageUrl(crawledImageUrl);
      console.log('디코딩된 실제 이미지 URL:', realImageUrl);
      
      if (realImageUrl) {
        // 2. 이미지 유효성 검증
        const isValid = await ImageUtils.validateImageUrl(realImageUrl);
        
        if (isValid) {
          setImageUrl(realImageUrl);
          
          // 3. photoService에 크롤링 이미지 추가
          photoService.addCrawledImage('국립중앙박물관', '서울특별시 용산구 서빙고로 137', crawledImageUrl);
          
          // 4. 데모 장소 데이터 생성
          const demoPlaceData = {
            id: 'demo-1',
            name: '국립중앙박물관',
            address: '서울특별시 용산구 서빙고로 137',
            category: '박물관',
            rating: 4.5,
            reviewCount: 1250,
            distance: 1.2,
            imageUrl: realImageUrl,
            imageSource: 'crawled'
          };
          
          setDemoPlace(demoPlaceData);
          console.log('✅ 크롤링 이미지 데모 초기화 완료');
        } else {
          console.error('❌ 이미지 유효성 검증 실패');
        }
      }
    } catch (error) {
      console.error('데모 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPhotoFromService = async () => {
    setIsLoading(true);
    
    try {
      // photoService에서 이미지 가져오기 (크롤링된 이미지가 우선 사용됨)
      const serviceImageUrl = await photoService.getPlacePhoto(
        '국립중앙박물관',
        '서울특별시 용산구 서빙고로 137',
        '박물관'
      );
      
      if (serviceImageUrl) {
        setImageUrl(serviceImageUrl);
        console.log('✅ PhotoService에서 이미지 가져오기 성공:', serviceImageUrl);
      }
    } catch (error) {
      console.error('PhotoService 이미지 가져오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !demoPlace) {
    return (
      <div className="crawled-image-demo">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>크롤링 이미지를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crawled-image-demo">
      <h2>🖼️ 크롤링 이미지 데모</h2>
      
      <div className="demo-section">
        <h3>1. 원본 크롤링 URL</h3>
        <div className="url-box">
          <code>{crawledImageUrl}</code>
        </div>
        
        <h3>2. 처리된 이미지</h3>
        <div className="image-container">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="크롤링된 장소 이미지" 
              className="demo-image"
            />
          ) : (
            <div className="no-image">이미지 없음</div>
          )}
        </div>
        
        <h3>3. 장소 정보</h3>
        {demoPlace && (
          <div className="place-info">
            <div className="place-name">{demoPlace.name}</div>
            <div className="place-address">{demoPlace.address}</div>
            <div className="place-category">🏛️ {demoPlace.category}</div>
            <div className="place-rating">
              ⭐ {demoPlace.rating} ({demoPlace.reviewCount}개 리뷰)
            </div>
            <div className="place-distance">🚶‍♂️ {demoPlace.distance}km</div>
            <div className="image-source">
              📸 이미지 소스: {demoPlace.imageSource}
            </div>
          </div>
        )}
        
        <h3>4. PhotoService 테스트</h3>
        <button 
          onClick={handleGetPhotoFromService}
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? '처리 중...' : 'PhotoService에서 이미지 가져오기'}
        </button>
      </div>
      
      <div className="code-example">
        <h3>💻 사용 코드 예제</h3>
        <pre className="code-block">
{`// 1. 크롤링된 이미지 URL 디코딩
const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);

// 2. PhotoService에 크롤링 이미지 추가
photoService.addCrawledImage(placeName, placeAddress, crawledUrl);

// 3. 장소 데이터에서 이미지 가져오기 (크롤링 이미지 우선)
const imageUrl = await photoService.getPlacePhoto(placeName, placeAddress, category);`}
        </pre>
      </div>
    </div>
  );
};

export default CrawledImageDemo;

