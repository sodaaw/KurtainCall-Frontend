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

  // 실제 센서 데이터 API 연동 (GET /sensor-result)
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 센서 데이터(전체) 조회 시작');
        const listResponse = await sensorAPI.getAllSensorResults();
        console.log('📊 전체 결과 응답:', listResponse);

        // 응답 형태: { success: true, count: n, data: [ {...}, {...} ] }
        const items = Array.isArray(listResponse?.data) ? listResponse.data : [];
        if (items.length === 0) {
          console.log('⚠️ 센서 분석 결과가 비어 있습니다');
          setMood("데이터 없음");
          setBiometricData(null);
          return;
        }

        // 최신(updatedAt 또는 timestamp 기준) 레코드 선택
        const latest = [...items].sort((a, b) => {
          const ta = new Date(a.updatedAt || a.timestamp || 0).getTime();
          const tb = new Date(b.updatedAt || b.timestamp || 0).getTime();
          return tb - ta;
        })[0];

        console.log('✅ 선택된 최신 레코드:', latest);

        const transformedData = {
          id: latest.id || latest._id,
          timestamp: latest.timestamp || latest.updatedAt || latest.createdAt || new Date().toISOString(),
          status: latest.status || 'ok',
          analysis: {
            avg_hr_bpm: latest.heartRate ?? 0,
            avg_spo2_pct: latest.oxygenSaturation ?? 0,
            avg_temperature_c: latest.temperature ?? 0,
            avg_humidity_pct: latest.humidity ?? 0,
          },
        };

        console.log('🔄 변환된 데이터:', transformedData);
        setBiometricData(transformedData);

        setGsr(latest.gsr ?? null);
        setSpo2(latest.oxygenSaturation ?? null);
        setMood(latest.user_status || mood);
        console.log('📈 상태 업데이트 완료:', { gsr: latest.gsr, spo2: latest.oxygenSaturation, mood: latest.user_status });
      } catch (error) {
        console.error('❌ 센서 데이터(전체) 조회 실패:', error);
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
