import React, { useState, useEffect } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';
import './CrawledImageExample.css';

const CrawledImageExample = () => {
  const [crawledImageUrl, setCrawledImageUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 제공해주신 크롤링 이미지 URL
  const exampleCrawledUrl = '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773';

  useEffect(() => {
    // 예제 URL로 자동 처리
    handleProcessImage(exampleCrawledUrl);
  }, []);

  const handleProcessImage = async (url) => {
    if (!url) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // 1. URL 디코딩
      const realImageUrl = ImageUtils.extractRealImageUrl(url);
      console.log('디코딩된 URL:', realImageUrl);
      
      if (realImageUrl) {
        // 2. 이미지 유효성 검증
        const isValid = await ImageUtils.validateImageUrl(realImageUrl);
        
        if (isValid) {
          setProcessedImageUrl(realImageUrl);
          console.log('✅ 이미지 처리 성공:', realImageUrl);
        } else {
          setError('이미지를 불러올 수 없습니다.');
        }
      } else {
        setError('URL을 디코딩할 수 없습니다.');
      }
    } catch (err) {
      console.error('이미지 처리 실패:', err);
      setError('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCrawledImageUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleProcessImage(crawledImageUrl);
  };

  const handleAddToPhotoService = async () => {
    if (processedImageUrl) {
      // photoService에 크롤링 이미지 추가
      photoService.addCrawledImage('테스트 장소', '테스트 주소', crawledImageUrl || exampleCrawledUrl);
      alert('크롤링 이미지가 photoService에 추가되었습니다!');
    }
  };

  return (
    <div className="crawled-image-example">
      <h2>🖼️ 크롤링 이미지 처리 예제</h2>
      
      <div className="example-section">
        <h3>1. 제공해주신 크롤링 URL</h3>
        <div className="url-display">
          <code>{exampleCrawledUrl}</code>
        </div>
        
        <h3>2. 디코딩된 실제 이미지 URL</h3>
        {processedImageUrl && (
          <div className="url-display">
            <code>{processedImageUrl}</code>
          </div>
        )}
        
        <h3>3. 처리된 이미지 미리보기</h3>
        <div className="image-preview">
          {isLoading && <div className="loading">이미지 로딩 중...</div>}
          {error && <div className="error">❌ {error}</div>}
          {processedImageUrl && !isLoading && !error && (
            <img 
              src={processedImageUrl} 
              alt="크롤링된 이미지" 
              className="preview-image"
              onError={() => setError('이미지 로드 실패')}
            />
          )}
        </div>
      </div>

      <div className="custom-section">
        <h3>4. 직접 URL 테스트</h3>
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={crawledImageUrl}
            onChange={handleInputChange}
            placeholder="크롤링된 이미지 URL을 입력하세요"
            className="url-input"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : '이미지 처리'}
          </button>
        </form>
      </div>

      <div className="action-section">
        <h3>5. PhotoService에 추가</h3>
        <button 
          onClick={handleAddToPhotoService}
          disabled={!processedImageUrl}
          className="add-button"
        >
          PhotoService에 크롤링 이미지 추가
        </button>
      </div>

      <div className="usage-section">
        <h3>📝 사용 방법</h3>
        <div className="usage-steps">
          <div className="step">
            <strong>1단계:</strong> 크롤링된 이미지 URL을 가져옵니다
          </div>
          <div className="step">
            <strong>2단계:</strong> <code>ImageUtils.extractRealImageUrl()</code>로 실제 URL을 추출합니다
          </div>
          <div className="step">
            <strong>3단계:</strong> <code>photoService.addCrawledImage()</code>로 서비스에 추가합니다
          </div>
          <div className="step">
            <strong>4단계:</strong> 장소 데이터에서 자동으로 크롤링된 이미지가 우선 사용됩니다
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrawledImageExample;

