import React from 'react';
import './BiometricVisualization.css';

const BiometricVisualization = ({ data }) => {
  // 샘플 데이터 (나중에 실제 API 데이터로 교체)
  const sampleData = {
    id: 123,
    timestamp: "2025-09-22T10:30:00Z",
    status: "ok",
    analysis: {
      avg_hr_bpm: 84,
      avg_spo2_pct: 97.1,
      avg_temperature_c: 26.4,
      avg_humidity_pct: 63.2
    }
  };

  const biometricData = data || sampleData;

  // 상태별 색상 결정 함수
  const getStatusColor = (type, value) => {
    switch (type) {
      case 'hr':
        if (value < 60) return '#4A90E2'; // 파란색 (낮음)
        if (value > 100) return '#E74C3C'; // 빨간색 (높음)
        return '#67C090'; // 녹색 (정상)
      case 'spo2':
        if (value < 95) return '#E74C3C'; // 빨간색 (낮음)
        if (value > 98) return '#4A90E2'; // 파란색 (높음)
        return '#67C090'; // 녹색 (정상)
      case 'temp':
        if (value < 20) return '#4A90E2'; // 파란색 (낮음)
        if (value > 30) return '#E74C3C'; // 빨간색 (높음)
        return '#67C090'; // 녹색 (정상)
      case 'humidity':
        if (value < 40) return '#4A90E2'; // 파란색 (낮음)
        if (value > 70) return '#E74C3C'; // 빨간색 (높음)
        return '#67C090'; // 녹색 (정상)
      default:
        return '#67C090';
    }
  };

  // 상태 텍스트 결정 함수
  const getStatusText = (type, value) => {
    switch (type) {
      case 'hr':
        if (value < 60) return '낮음';
        if (value > 100) return '높음';
        return '정상';
      case 'spo2':
        if (value < 95) return '낮음';
        if (value > 98) return '높음';
        return '정상';
      case 'temp':
        if (value < 20) return '낮음';
        if (value > 30) return '높음';
        return '정상';
      case 'humidity':
        if (value < 40) return '낮음';
        if (value > 70) return '높음';
        return '정상';
      default:
        return '정상';
    }
  };

  return (
    <div className="biometric-visualization">
      <div className="biometric-header">
        <h3>📊 실시간 생체 데이터</h3>
        <div className="timestamp">
          {/* <span className="status-indicator status-ok"></span> */}
          {new Date(biometricData.timestamp).toLocaleString('ko-KR')}
        </div>
      </div>

      <div className="biometric-grid">
        {/* 심박수 */}
        <div className="metric-card">
          <div className="metric-icon">💓</div>
          <div className="metric-content">
            <h4>심박수</h4>
            <div className="metric-value" style={{ color: getStatusColor('hr', biometricData.analysis.avg_hr_bpm) }}>
              {biometricData.analysis.avg_hr_bpm} BPM
            </div>
            <div className="metric-status" style={{ color: getStatusColor('hr', biometricData.analysis.avg_hr_bpm) }}>
              {getStatusText('hr', biometricData.analysis.avg_hr_bpm)}
            </div>
          </div>
          <div className="metric-chart">
            <div className="chart-bar" style={{ 
              height: `${Math.min((biometricData.analysis.avg_hr_bpm / 120) * 100, 100)}%`,
              backgroundColor: getStatusColor('hr', biometricData.analysis.avg_hr_bpm)
            }}></div>
          </div>
        </div>

        {/* 산소포화도 */}
        <div className="metric-card">
          <div className="metric-icon">🫁</div>
          <div className="metric-content">
            <h4>산소포화도</h4>
            <div className="metric-value" style={{ color: getStatusColor('spo2', biometricData.analysis.avg_spo2_pct) }}>
              {biometricData.analysis.avg_spo2_pct}%
            </div>
            <div className="metric-status" style={{ color: getStatusColor('spo2', biometricData.analysis.avg_spo2_pct) }}>
              {getStatusText('spo2', biometricData.analysis.avg_spo2_pct)}
            </div>
          </div>
          <div className="metric-chart">
            <div className="chart-bar" style={{ 
              height: `${biometricData.analysis.avg_spo2_pct}%`,
              backgroundColor: getStatusColor('spo2', biometricData.analysis.avg_spo2_pct)
            }}></div>
          </div>
        </div>

        {/* 체온 */}
        <div className="metric-card">
          <div className="metric-icon">🌡️</div>
          <div className="metric-content">
            <h4>체온</h4>
            <div className="metric-value" style={{ color: getStatusColor('temp', biometricData.analysis.avg_temperature_c) }}>
              {biometricData.analysis.avg_temperature_c}°C
            </div>
            <div className="metric-status" style={{ color: getStatusColor('temp', biometricData.analysis.avg_temperature_c) }}>
              {getStatusText('temp', biometricData.analysis.avg_temperature_c)}
            </div>
          </div>
          <div className="metric-chart">
            <div className="chart-bar" style={{ 
              height: `${Math.min(((biometricData.analysis.avg_temperature_c - 20) / 15) * 100, 100)}%`,
              backgroundColor: getStatusColor('temp', biometricData.analysis.avg_temperature_c)
            }}></div>
          </div>
        </div>

        {/* 습도 */}
        <div className="metric-card">
          <div className="metric-icon">💧</div>
          <div className="metric-content">
            <h4>습도</h4>
            <div className="metric-value" style={{ color: getStatusColor('humidity', biometricData.analysis.avg_humidity_pct) }}>
              {biometricData.analysis.avg_humidity_pct}%
            </div>
            <div className="metric-status" style={{ color: getStatusColor('humidity', biometricData.analysis.avg_humidity_pct) }}>
              {getStatusText('humidity', biometricData.analysis.avg_humidity_pct)}
            </div>
          </div>
          <div className="metric-chart">
            <div className="chart-bar" style={{ 
              height: `${biometricData.analysis.avg_humidity_pct}%`,
              backgroundColor: getStatusColor('humidity', biometricData.analysis.avg_humidity_pct)
            }}></div>
          </div>
        </div>
      </div>

      {/* 전체 상태 요약 */}
      <div className="overall-status">
        <div className="status-summary">
          <h4>전체 상태</h4>
          <div className="status-badge status-good">
            <span className="status-icon">✅</span>
            <span>양호</span>
          </div>
        </div>
        <div className="recommendation">
          <p>현재 상태가 양호합니다. 공연 관람에 적합한 상태예요! 🎭</p>
        </div>
      </div>
    </div>
  );
};

export default BiometricVisualization;
