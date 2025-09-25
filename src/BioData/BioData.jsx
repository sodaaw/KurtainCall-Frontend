// src/BioData/BioData.jsx
import React, { useState, useEffect } from "react";
import Topnav from "../components/Topnav";
import BiometricVisualization from "../components/BiometricVisualization";
import BiometricAnalysis from "../components/BiometricAnalysis";
import RecommendedPlaces from "../components/RecommendedPlaces";
import { sensorAPI } from "../services/api";
import { getBiometricPlaceRecommendation } from "../utils/biometricAnalysis";
import "./BioData.css";

export default function BioData() {
  const [biometricData, setBiometricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [biometricRecommendation, setBiometricRecommendation] = useState(null);

  // 실제 API에서 최신 센서 분석 결과 조회
  useEffect(() => {
    const loadSensorData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🌐 최신 센서 분석 결과 조회 시작...');
        const data = await sensorAPI.getLatestSensorResult();
        
        console.log('📡 API 응답 데이터:', data);
        
        // API 데이터를 기존 형식으로 변환
        const transformedData = {
          id: data._id || data.id,
          timestamp: data.timestamp || data.createdAt,
          status: data.status,
          user_status: data.user_status,
          led_signal: data.led_signal,
          analysis: {
            avg_hr_bpm: data.temperature || 0, // API에서 temperature 필드 사용
            avg_spo2_pct: data.humidity || 0,   // API에서 humidity 필드 사용
            avg_temperature_c: data.temperature || 0,
            avg_humidity_pct: data.humidity || 0,
          },
        };
        
        console.log('✅ 변환된 생체데이터:', transformedData);
        setBiometricData(transformedData);
        
        // 생체데이터 기반 장소 추천 생성
        const recommendation = getBiometricPlaceRecommendation(transformedData);
        setBiometricRecommendation(recommendation);
        console.log('🧠 생체데이터 기반 추천:', recommendation);
        
        setLoading(false);
        
      } catch (error) {
        console.error('❌ 센서 데이터 로드 실패:', error);
        setError(error.message || '센서 데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    loadSensorData();
  }, []);

  return (
    <div className="biodata-page">
      <Topnav />
      <h2>생체 데이터 측정</h2>
      <p>당신의 현재 상태에 기반한 맞춤 공연을 추천해드려요 🎭</p>

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>센서 데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="error-container">
          <p>❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 센서 데이터가 있는 경우 */}
      {!loading && !error && biometricData && (
        <>
          {/* 센서 상태 정보 */}
          <div className="sensor-status-container">
            <div className="status-card">
              <h3>📊 센서 상태</h3>
              <div className="status-info">
                <p><strong>상태:</strong> {biometricData.status}</p>
                <p><strong>사용자 상태:</strong> {biometricData.user_status}</p>
                <p><strong>LED 신호:</strong> 
                  <span className={`led-signal led-${biometricData.led_signal}`}>
                    {biometricData.led_signal}
                  </span>
                </p>
                <p><strong>측정 시간:</strong> {new Date(biometricData.timestamp).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          </div>

          {/* 생체데이터 시각화 컴포넌트 */}
          <BiometricVisualization data={biometricData} />

          {/* 생체데이터 분석 결과 */}
          <BiometricAnalysis data={biometricData} />
        </>
      )}

      {/* 데이터가 없는 경우 */}
      {!loading && !error && !biometricData && (
        <div className="no-data-container">
          <p>📊 센서 데이터가 없습니다.</p>
          <p>하드웨어 기기를 연결하고 데이터를 측정해주세요.</p>
        </div>
      )}

        {/* 생체데이터 기반 추천 메시지 */}
        {biometricRecommendation && (
          <div className="biometric-recommendation">
            <div className="recommendation-header">
              <h3>🧠 생체데이터 기반 추천</h3>
              <p className="recommendation-message">{biometricRecommendation.message}</p>
              <p className="recommendation-reason">💡 {biometricRecommendation.reason}</p>
            </div>
          </div>
        )}

        {/* 생체데이터 기반 추천 장소 섹션 */}
        {biometricRecommendation && biometricRecommendation.categories.length > 0 ? (
          <RecommendedPlaces 
            title={`🧠 ${biometricRecommendation.message}`}
            genre={biometricRecommendation.categories[0]} // 첫 번째 카테고리 사용
            limit={6}
          />
        ) : (
          <RecommendedPlaces 
            title="📍 내 주변 문화시설" 
            limit={6}
          />
        )}
      </div>
    );
  }
