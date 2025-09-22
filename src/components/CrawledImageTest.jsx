import React, { useState, useEffect } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';
import './CrawledImageTest.css';

const CrawledImageTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 제공해주신 크롤링 이미지 URL
  const testCrawledUrl = '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA5MDVfMjky%2FMDAxNzU3MDM0MDY3Njg4.oQTlR7D2SKKBpiaCdkVllcuBmpcq6PtDwHD4rQKN-YUg.B7E6ynXCf2PauCaOTuapCvkkv2cSzrbfEZ5bqBOdHf4g.JPEG%2F20250904_095833.jpg%3Ftype%3Dw773';

  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 크롤링 이미지 테스트 시작');
      
      // 1. URL 디코딩 테스트
      console.log('1️⃣ URL 디코딩 테스트');
      const realImageUrl = ImageUtils.extractRealImageUrl(testCrawledUrl);
      console.log('디코딩된 URL:', realImageUrl);
      
      if (!realImageUrl) {
        throw new Error('URL 디코딩 실패');
      }
      
      // 2. 이미지 유효성 검증 테스트
      console.log('2️⃣ 이미지 유효성 검증 테스트');
      const isValid = await ImageUtils.validateImageUrl(realImageUrl);
      console.log('이미지 유효성:', isValid);
      
      if (!isValid) {
        throw new Error('이미지 유효성 검증 실패');
      }
      
      // 3. PhotoService 통합 테스트
      console.log('3️⃣ PhotoService 통합 테스트');
      photoService.addCrawledImage('테스트 장소', '테스트 주소', testCrawledUrl);
      
      const serviceImageUrl = await photoService.getPlacePhoto(
        '테스트 장소',
        '테스트 주소',
        '테스트 카테고리'
      );
      
      console.log('PhotoService에서 가져온 이미지:', serviceImageUrl);
      
      // 4. 결과 설정
      setTestResult({
        success: true,
        originalUrl: testCrawledUrl,
        decodedUrl: realImageUrl,
        isValid,
        serviceImageUrl,
        steps: [
          { step: 1, name: 'URL 디코딩', status: 'success', message: '성공적으로 디코딩되었습니다' },
          { step: 2, name: '이미지 유효성 검증', status: 'success', message: '이미지가 유효합니다' },
          { step: 3, name: 'PhotoService 통합', status: 'success', message: 'PhotoService에 성공적으로 추가되었습니다' },
          { step: 4, name: '이미지 가져오기', status: 'success', message: 'PhotoService에서 이미지를 성공적으로 가져왔습니다' }
        ]
      });
      
      console.log('✅ 모든 테스트 통과');
    } catch (error) {
      console.error('❌ 테스트 실패:', error);
      setTestResult({
        success: false,
        error: error.message,
        steps: [
          { step: 1, name: 'URL 디코딩', status: 'error', message: error.message },
          { step: 2, name: '이미지 유효성 검증', status: 'pending', message: '이전 단계 실패로 인해 건너뜀' },
          { step: 3, name: 'PhotoService 통합', status: 'pending', message: '이전 단계 실패로 인해 건너뜀' },
          { step: 4, name: '이미지 가져오기', status: 'pending', message: '이전 단계 실패로 인해 건너뜀' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'pending': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <div className="crawled-image-test">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>크롤링 이미지 테스트 중...</h3>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crawled-image-test">
      <h2>🧪 크롤링 이미지 테스트</h2>
      
      <div className="test-info">
        <p>제공해주신 크롤링 이미지 URL을 사용하여 전체 워크플로우를 테스트합니다.</p>
        <div className="test-url">
          <strong>테스트 URL:</strong>
          <code>{testCrawledUrl}</code>
        </div>
      </div>

      {testResult && (
        <div className="test-results">
          <h3>테스트 결과</h3>
          
          <div className={`result-summary ${testResult.success ? 'success' : 'error'}`}>
            {testResult.success ? (
              <>
                <div className="result-icon">✅</div>
                <div className="result-text">
                  <h4>모든 테스트 통과!</h4>
                  <p>크롤링 이미지가 성공적으로 처리되었습니다.</p>
                </div>
              </>
            ) : (
              <>
                <div className="result-icon">❌</div>
                <div className="result-text">
                  <h4>테스트 실패</h4>
                  <p>{testResult.error}</p>
                </div>
              </>
            )}
          </div>

          <div className="test-steps">
            <h4>테스트 단계</h4>
            {testResult.steps.map((step, index) => (
              <div key={index} className="test-step">
                <div className="step-header">
                  <span className="step-number">{step.step}</span>
                  <span className="step-name">{step.name}</span>
                  <span 
                    className="step-status"
                    style={{ color: getStatusColor(step.status) }}
                  >
                    {getStatusIcon(step.status)}
                  </span>
                </div>
                <div className="step-message">{step.message}</div>
              </div>
            ))}
          </div>

          {testResult.success && (
            <div className="test-outputs">
              <div className="output-section">
                <h4>디코딩된 URL</h4>
                <div className="url-display">
                  <code>{testResult.decodedUrl}</code>
                </div>
              </div>
              
              <div className="output-section">
                <h4>이미지 미리보기</h4>
                <div className="image-preview">
                  <img 
                    src={testResult.decodedUrl} 
                    alt="테스트 이미지" 
                    className="test-image"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="test-actions">
        <button 
          onClick={runTest}
          disabled={isLoading}
          className="retry-button"
        >
          {isLoading ? '테스트 중...' : '테스트 다시 실행'}
        </button>
      </div>
    </div>
  );
};

export default CrawledImageTest;

