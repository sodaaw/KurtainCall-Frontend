import React, { useState } from 'react';
import './DeviceInput.css';

const DeviceInput = ({ onDeviceSubmit, isLoggedIn, deviceId }) => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deviceNumber.trim()) {
      setError('기기번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 기기번호 검증 및 로그인 처리
      await onDeviceSubmit(deviceNumber.trim());
      
      // 성공 시 입력창 초기화
      setDeviceNumber('');
    } catch (err) {
      setError(err.message || '기기번호가 올바르지 않습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDeviceNumber(e.target.value);
    if (error) setError(''); // 에러 메시지 클리어
  };

  // 이미 로그인된 상태라면 기기 정보 표시
  if (isLoggedIn && deviceId) {
    return (
      <div className="device-status">
        <div className="device-status-content">
          <div className="device-icon">
            <img src="/icons/vest.png" alt="device" />
          </div>
          <div className="device-info">
            <span className="device-label">연결된 기기</span>
            <span className="device-id">{deviceId}</span>
          </div>
          <button 
            className="device-logout-btn"
            onClick={() => onDeviceSubmit(null)} // 로그아웃
            title="기기 연결 해제"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-input-section">
      <form className="device-input-form" onSubmit={handleSubmit}>
        <div className="device-input-wrapper">
          <div className="device-input-icon">
            <img src="/icons/vest.png" alt="device" />
          </div>
          
          <input
            type="text"
            placeholder="기기번호를 입력하세요"
            value={deviceNumber}
            onChange={handleInputChange}
            className="device-input"
            disabled={isLoading}
            maxLength="20"
          />
          
          <button 
            type="submit" 
            className="device-submit-btn"
            disabled={isLoading || !deviceNumber.trim()}
          >
            {isLoading ? (
              <div className="device-loading-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            )}
          </button>
        </div>
        
        {error && (
          <div className="device-error">
            <div className="device-error-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default DeviceInput;
