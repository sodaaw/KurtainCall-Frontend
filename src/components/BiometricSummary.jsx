import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BiometricSummary.css';

const BiometricSummary = ({ data, recommendation, onRefresh, refreshing = false }) => {
  const navigate = useNavigate();

  if (!data || !recommendation) return null;

  const handleDetailClick = () => {
    navigate('/biodata');
  };

  // 간략한 상태 요약 생성
  const getStatusSummary = () => {
    const temp = data.analysis.avg_temperature_c;
    const humidity = data.analysis.avg_humidity_pct;
    
    if (temp > 26) return `주변 온도 ${temp}°C로 높아 시원한 곳을 추천합니다.`;
    if (temp < 24) return `주변 온도 ${temp}°C로 낮아 따뜻한 곳을 추천합니다.`;
    if (humidity < 55) return `습도 ${humidity}%로 낮아 수분 보충이 필요합니다.`;
    if (humidity > 60) return `습도 ${humidity}%로 높아 시원한 곳을 추천합니다.`;
    return `주변 온도 ${temp}°C, 습도 ${humidity}%로 정상이므로 모든 장소를 추천합니다.`;
  };

  return (
    <div className="biometric-summary">
      <div className="summary-header">
        <div className="summary-content">
          <h3>환경데이터 기반 추천</h3>
          <p className="summary-message">{getStatusSummary()}</p>
        </div>
        <div className="button-group">
          <button 
            className="detail-button"
            onClick={handleDetailClick}
            title="환경데이터 자세히 보기"
          >
            자세히 알아보기
          </button>
          {onRefresh && (
            <button
              className={`refresh-button${refreshing ? ' refreshing' : ''}`}
              onClick={onRefresh}
              title="최신 데이터로 새로고침"
              aria-label="최신 데이터로 새로고침"
              disabled={refreshing}
            >
              {refreshing ? '⏳' : '🔄'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricSummary;
