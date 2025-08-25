// src/components/SearchModal.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchModal.css";

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const trendingKeywords = useMemo(
    () => ["대학로", "로맨스", "코미디", "연극", "혜화역"], []
  );

  const goSearch = (kw) => {
    const query = (kw ?? q).trim();
    if (!query) return;
    onClose(); // 모달 닫기
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="search-modal-overlay" onClick={handleOverlayClick}>
      <div className="search-modal">
        <div className="curtain-decoration"></div>
        <button className="close-btn" onClick={onClose}>✕</button>

        {/* 검색창 */}
        <form className="search-input-area" onSubmit={(e)=>{e.preventDefault(); goSearch();}}>
          <input
            type="text"
            placeholder="작품명, 장르, 공연장, 주소로 검색"
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <button className="search-btn" type="submit">Go</button>
        </form>

        {/* 실시간 키워드 */}
        <div className="top-search-box">
          <div className="top-search-header">실시간 검색어</div>
          <ul className="top-search-list">
            {trendingKeywords.map((keyword, idx) => (
              <li key={idx}>
                <span className="rank">{idx + 1}</span>
                <button className="kw-btn" type="button" onClick={() => goSearch(keyword)}>
                  {keyword}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
