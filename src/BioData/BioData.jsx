// src/BioData/BioData.jsx
import React, { useState, useEffect } from "react";
import Topnav from "../components/Topnav";
import "./BioData.css";

export default function BioData() {
  const [gsr, setGsr] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [mood, setMood] = useState("분석 중...");

  // ✅ 나중에 실제 기기 API 연동할 자리
  useEffect(() => {
    // 예시: 더미 데이터
    setGsr(0.75);     // 피부전도 반응
    setSpo2(98);      // 산소포화도
    setMood("차분함"); 
  }, []);

  return (
    <div className="biodata-page">
      <Topnav />
      <h2>생체 데이터 측정</h2>
      <p>당신의 현재 상태에 기반한 맞춤 공연을 추천해드려요 🎭</p>

      <div className="bio-card">
        <h3>📊 실시간 데이터</h3>
        <p><strong>GSR:</strong> {gsr !== null ? gsr : "측정 중..."}</p>
        <p><strong>SpO₂:</strong> {spo2 !== null ? `${spo2}%` : "측정 중..."}</p>
      </div>

      <div className="bio-card mood">
        <h3>🧠 분석 결과</h3>
        <p>현재 상태: <strong>{mood}</strong></p>
      </div>

      <button className="recommend-btn">
        🎭 추천 공연 보러가기
      </button>
    </div>
  );
}
