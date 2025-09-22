import React, { useState } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';
import './CrawledImageUsage.css';

const CrawledImageUsage = () => {
  const [crawledUrl, setCrawledUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 제공해주신 예제 URL
  const exampleUrl = '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773';

  const handleProcessUrl = async () => {
    if (!crawledUrl.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      // 1. URL 디코딩
      const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);
      
      if (realImageUrl) {
        // 2. 이미지 유효성 검증
        const isValid = await ImageUtils.validateImageUrl(realImageUrl);
        
        setResult({
          originalUrl: crawledUrl,
          decodedUrl: realImageUrl,
          isValid,
          success: isValid
        });
        
        if (isValid) {
          // 3. PhotoService에 추가 (예시)
          photoService.addCrawledImage('테스트 장소', '테스트 주소', crawledUrl);
          console.log('✅ 크롤링 이미지가 PhotoService에 추가되었습니다');
        }
      } else {
        setResult({
          originalUrl: crawledUrl,
          decodedUrl: null,
          isValid: false,
          success: false,
          error: 'URL을 디코딩할 수 없습니다'
        });
      }
    } catch (error) {
      setResult({
        originalUrl: crawledUrl,
        decodedUrl: null,
        isValid: false,
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExample = () => {
    setCrawledUrl(exampleUrl);
  };

  return (
    <div className="crawled-image-usage">
      <h2>🕷️ 크롤링 이미지 사용법</h2>
      
      <div className="usage-section">
        <h3>1. 크롤링된 이미지 URL 입력</h3>
        <div className="input-group">
          <input
            type="text"
            value={crawledUrl}
            onChange={(e) => setCrawledUrl(e.target.value)}
            placeholder="크롤링된 이미지 URL을 입력하세요"
            className="url-input"
          />
          <button 
            onClick={handleUseExample}
            className="example-button"
          >
            예제 URL 사용
          </button>
        </div>
        
        <button 
          onClick={handleProcessUrl}
          disabled={!crawledUrl.trim() || isLoading}
          className="process-button"
        >
          {isLoading ? '처리 중...' : '이미지 처리'}
        </button>
      </div>

      {result && (
        <div className="result-section">
          <h3>2. 처리 결과</h3>
          
          <div className="result-item">
            <h4>원본 URL</h4>
            <div className="url-display">
              <code>{result.originalUrl}</code>
            </div>
          </div>
          
          <div className="result-item">
            <h4>디코딩된 URL</h4>
            <div className="url-display">
              <code>{result.decodedUrl || '디코딩 실패'}</code>
            </div>
          </div>
          
          <div className="result-item">
            <h4>이미지 유효성</h4>
            <div className={`status-badge ${result.isValid ? 'valid' : 'invalid'}`}>
              {result.isValid ? '✅ 유효한 이미지' : '❌ 유효하지 않은 이미지'}
            </div>
          </div>
          
          {result.success && result.decodedUrl && (
            <div className="result-item">
              <h4>이미지 미리보기</h4>
              <div className="image-preview">
                <img 
                  src={result.decodedUrl} 
                  alt="처리된 이미지" 
                  className="preview-image"
                />
              </div>
            </div>
          )}
          
          {result.error && (
            <div className="error-message">
              ❌ 오류: {result.error}
            </div>
          )}
        </div>
      )}

      <div className="code-examples">
        <h3>3. 코드 사용법</h3>
        
        <div className="code-example">
          <h4>기본 사용법</h4>
          <pre className="code-block">
{`import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';

// 크롤링된 이미지 URL 처리
const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);
const isValid = await ImageUtils.validateImageUrl(realImageUrl);

if (isValid) {
  // PhotoService에 크롤링 이미지 추가
  photoService.addCrawledImage(placeName, placeAddress, crawledUrl);
}`}
          </pre>
        </div>
        
        <div className="code-example">
          <h4>장소 데이터에 적용</h4>
          <pre className="code-block">
{`// 장소 데이터 생성 시 크롤링 이미지 적용
const place = {
  id: 'place-1',
  name: '국립중앙박물관',
  address: '서울특별시 용산구 서빙고로 137',
  category: '박물관',
  imageUrl: realImageUrl || await photoService.getPlacePhoto(...),
  imageSource: isValid ? 'crawled' : 'service'
};`}
          </pre>
        </div>
        
        <div className="code-example">
          <h4>React 컴포넌트에서 사용</h4>
          <pre className="code-block">
{`const PlaceCard = ({ place, crawledImageUrl }) => {
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    const loadImage = async () => {
      if (crawledImageUrl) {
        const realUrl = ImageUtils.extractRealImageUrl(crawledImageUrl);
        const isValid = await ImageUtils.validateImageUrl(realUrl);
        if (isValid) {
          setImageUrl(realUrl);
          return;
        }
      }
      
      // 크롤링 이미지가 없거나 유효하지 않은 경우
      const serviceUrl = await photoService.getPlacePhoto(
        place.name, place.address, place.category
      );
      setImageUrl(serviceUrl);
    };
    
    loadImage();
  }, [place, crawledImageUrl]);
  
  return (
    <div className="place-card">
      <img src={imageUrl} alt={place.name} />
      <h3>{place.name}</h3>
    </div>
  );
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CrawledImageUsage;

