// src/BioData/BioData.jsx
import React, { useState, useEffect } from "react";
import Topnav from "../components/Topnav";
import BiometricVisualization from "../components/BiometricVisualization";
import "./BioData.css";

export default function BioData() {
  const [gsr, setGsr] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [mood, setMood] = useState("분석 중...");
  const [biometricData, setBiometricData] = useState(null);

  // ✅ 나중에 실제 기기 API 연동할 자리
  useEffect(() => {
    // 예시: 더미 데이터
    setGsr(0.75);     // 피부전도 반응
    setSpo2(98);      // 산소포화도
    setMood("차분함"); 
    
    // 하드웨어에서 받은 생체데이터 (샘플)
    setBiometricData({
      id: 123,
      timestamp: new Date().toISOString(),
      status: "ok",
      analysis: {
        avg_hr_bpm: 84,
        avg_spo2_pct: 97.1,
        avg_temperature_c: 26.4,
        avg_humidity_pct: 63.2
      }
    });
  }, []);

  return (
    <div className="biodata-page">
      <Topnav />
      <h2>생체 데이터 측정</h2>
      <p>당신의 현재 상태에 기반한 맞춤 공연을 추천해드려요 🎭</p>

      {/* 새로운 생체데이터 시각화 컴포넌트 */}
      {biometricData && (
        <BiometricVisualization data={biometricData} />
      )}

      <button className="recommend-btn">
        🎭 추천 공연 보러가기
      </button>
    </div>
  );
}
