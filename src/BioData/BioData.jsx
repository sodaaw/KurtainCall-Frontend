// src/BioData/BioData.jsx
import React, { useState, useEffect } from "react";
import Topnav from "../components/Topnav";
import BiometricVisualization from "../components/BiometricVisualization";
import BiometricAnalysis from "../components/BiometricAnalysis";
import { sensorAPI } from "../services/api";
import "./BioData.css";

export default function BioData() {
  const [gsr, setGsr] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [mood, setMood] = useState("분석 중...");
  const [biometricData, setBiometricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 실제 센서 데이터 API 연동
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 사용자 ID (임시로 123 사용, 실제로는 로그인한 사용자 ID 사용)
        const userId = 123;
        console.log('🔍 센서 데이터 조회 시작 - 사용자 ID:', userId);
        
        // 센서 분석 결과 조회
        const sensorResult = await sensorAPI.getSensorResultById(userId);
        console.log('📊 API 응답 데이터:', sensorResult);
        
        if (sensorResult) {
          console.log('✅ 센서 데이터 수신 성공');
          console.log('📋 원본 데이터:', sensorResult);
          
          // API 응답 구조 확인 및 데이터 추출
          const actualData = sensorResult.data || sensorResult;
          console.log('🔍 실제 센서 데이터:', actualData);
          
          // API 응답 데이터를 컴포넌트 상태에 맞게 변환
          const transformedData = {
            id: actualData.id || actualData._id,
            timestamp: actualData.timestamp || new Date().toISOString(),
            status: actualData.status || 'ok',
            analysis: {
              avg_hr_bpm: actualData.heartRate || actualData.avg_hr_bpm || 0,
              avg_spo2_pct: actualData.oxygenSaturation || actualData.avg_spo2_pct || 0,
              avg_temperature_c: actualData.temperature || actualData.avg_temperature_c || 0,
              avg_humidity_pct: actualData.humidity || actualData.avg_humidity_pct || 0
            }
          };
          
          console.log('🔄 변환된 데이터:', transformedData);
          setBiometricData(transformedData);
          
          // 기존 상태들도 업데이트
          setGsr(actualData.gsr || 0.75);
          setSpo2(actualData.oxygenSaturation || actualData.avg_spo2_pct || 98);
          setMood(actualData.user_status || "분석 중...");
          
          console.log('📈 상태 업데이트 완료:', {
            gsr: actualData.gsr || 0.75,
            spo2: actualData.oxygenSaturation || actualData.avg_spo2_pct || 98,
            mood: actualData.user_status || "분석 중..."
          });
        } else {
          console.log('⚠️ 센서 데이터가 없습니다');
          setMood("데이터 없음");
        }
      } catch (error) {
        console.error('❌ 센서 데이터 조회 실패:', error);
        console.error('🔍 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setError('센서 데이터를 불러올 수 없습니다.');
        setMood("데이터 로딩 실패");
      } finally {
        setLoading(false);
        console.log('🏁 센서 데이터 로딩 완료');
      }
    };

    fetchSensorData();
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
          {/* 새로운 생체데이터 시각화 컴포넌트 */}
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

      <button className="recommend-btn">
        🎭 추천 공연 보러가기
      </button>
    </div>
  );
}
