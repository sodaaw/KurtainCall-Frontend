import React from 'react';
import './BiometricAnalysis.css';
import { analyzeBiometricData, getPerformanceRecommendation } from '../utils/biometricAnalysis';

const BiometricAnalysis = ({ data }) => {
  if (!data) return null;

  const analysis = analyzeBiometricData(data);
  const recommendation = getPerformanceRecommendation(analysis);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'caution': return '⚡';
      case 'normal': return '✅';
      default: return '📊';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'critical': return '위험';
      case 'warning': return '주의';
      case 'caution': return '주의';
      case 'normal': return '정상';
      default: return '분석중';
    }
  };

  return (
    <div className="biometric-analysis">
      {/* 전체 상태 요약 */}
      <div className="overall-analysis">
        <div className="analysis-header">
          <h3>🧠 생체데이터 분석 결과</h3>
          <div className="overall-status" style={{ color: analysis.overall.color }}>
            <span className="status-icon">{getStatusIcon(analysis.overall.status)}</span>
            <span className="status-text">{getStatusText(analysis.overall.status)}</span>
          </div>
        </div>
        <div className="overall-message">
          <p>{analysis.overall.message}</p>
        </div>
      </div>

      {/* 상세 분석 결과 */}
      <div className="detailed-analysis">
        <h4>📋 상세 분석</h4>
        <div className="analysis-grid">
          {/* 심박수 분석 */}
          <div className="analysis-item">
            <div className="analysis-header-item">
              <span className="metric-icon">💓</span>
              <span className="metric-name">심박수</span>
              <span className="metric-value">{data.analysis.avg_hr_bpm} BPM</span>
            </div>
            <div className="analysis-content">
              <div className="status-badge" style={{ backgroundColor: analysis.details.heartRate.color + '20', color: analysis.details.heartRate.color }}>
                {analysis.details.heartRate.level}
              </div>
              <p className="analysis-message">{analysis.details.heartRate.message}</p>
              <p className="analysis-recommendation">{analysis.details.heartRate.recommendation}</p>
            </div>
          </div>

          {/* 산소포화도 분석 */}
          <div className="analysis-item">
            <div className="analysis-header-item">
              <span className="metric-icon">🫁</span>
              <span className="metric-name">산소포화도</span>
              <span className="metric-value">{data.analysis.avg_spo2_pct}%</span>
            </div>
            <div className="analysis-content">
              <div className="status-badge" style={{ backgroundColor: analysis.details.oxygenSaturation.color + '20', color: analysis.details.oxygenSaturation.color }}>
                {analysis.details.oxygenSaturation.level}
              </div>
              <p className="analysis-message">{analysis.details.oxygenSaturation.message}</p>
              <p className="analysis-recommendation">{analysis.details.oxygenSaturation.recommendation}</p>
            </div>
          </div>

          {/* 체온 분석 */}
          <div className="analysis-item">
            <div className="analysis-header-item">
              <span className="metric-icon">🌡️</span>
              <span className="metric-name">체온</span>
              <span className="metric-value">{data.analysis.avg_temperature_c}°C</span>
            </div>
            <div className="analysis-content">
              <div className="status-badge" style={{ backgroundColor: analysis.details.temperature.color + '20', color: analysis.details.temperature.color }}>
                {analysis.details.temperature.level}
              </div>
              <p className="analysis-message">{analysis.details.temperature.message}</p>
              <p className="analysis-recommendation">{analysis.details.temperature.recommendation}</p>
            </div>
          </div>

          {/* 습도 분석 */}
          <div className="analysis-item">
            <div className="analysis-header-item">
              <span className="metric-icon">💧</span>
              <span className="metric-name">습도</span>
              <span className="metric-value">{data.analysis.avg_humidity_pct}%</span>
            </div>
            <div className="analysis-content">
              <div className="status-badge" style={{ backgroundColor: analysis.details.humidity.color + '20', color: analysis.details.humidity.color }}>
                {analysis.details.humidity.level}
              </div>
              <p className="analysis-message">{analysis.details.humidity.message}</p>
              <p className="analysis-recommendation">{analysis.details.humidity.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 공연 추천 */}
      <div className="performance-recommendation">
        <h4>🎭 공연 추천</h4>
        <div className="recommendation-content">
          <p className="recommendation-message">{recommendation.message}</p>
          <p className="recommendation-detail">{recommendation.recommendation}</p>
          {recommendation.suitableGenres.length > 0 && (
            <div className="suitable-genres">
              <span className="genres-label">추천 장르:</span>
              <div className="genres-tags">
                {recommendation.suitableGenres.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricAnalysis;
