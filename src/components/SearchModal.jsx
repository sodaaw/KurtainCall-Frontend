// src/components/SearchModal.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchModal.css";

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리");
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
  const [selectedMonth, setSelectedMonth] = useState("전체 월");
  const navigate = useNavigate();

  const trendingKeywords = useMemo(
    () => ["홍익대학교", "동국대학교", "세종대학교", "국민대학교", "서울대학교", "연세대학교", "고려대학교", "한양대학교"], []
  );

  const goSearch = (kw) => {
    const query = (kw ?? q).trim();
    if (!query) return;
    onClose(); // 모달 닫기
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const applyFilters = () => {
    const filters = [];
    if (selectedCategory !== "전체 카테고리") filters.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (selectedRegion !== "전체 지역") filters.push(`region=${encodeURIComponent(selectedRegion)}`);
    if (selectedMonth !== "전체 월") filters.push(`month=${encodeURIComponent(selectedMonth)}`);
    
    const query = q.trim();
    const searchParams = query ? `q=${encodeURIComponent(query)}` : '';
    const filterParams = filters.length > 0 ? `&${filters.join('&')}` : '';
    
    onClose();
    navigate(`/search?${searchParams}${filterParams}`);
  };

  const resetFilters = () => {
    setQ("");
    setSelectedCategory("전체 카테고리");
    setSelectedRegion("전체 지역");
    setSelectedMonth("전체 월");
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
            placeholder="대학교명 또는 축제를 검색해 보세요"
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <button className="search-search-btn" type="submit">Go</button>
        </form>

        {/* 필터 섹션 */}
        <div className="filter-section">
          <div className="filter-header">검색 및 필터</div>
          
          <div className="filter-dropdowns">
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="전체 카테고리">전체 카테고리</option>
              <option value="대동제">대동제</option>
              <option value="봄축제">봄축제</option>
              <option value="연희">연희</option>
              <option value="일감호축전">일감호축전</option>
            </select>

            <select 
              className="filter-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="전체 지역">전체 지역</option>
              <option value="마포구">마포구</option>
              <option value="성북구">성북구</option>
              <option value="동작구">동작구</option>
              <option value="광진구">광진구</option>
              <option value="중구">중구</option>
              <option value="동대문구">동대문구</option>
            </select>

            <select 
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="전체 월">전체 월</option>
              <option value="5월">5월</option>
              <option value="6월">6월</option>
              <option value="9월">9월</option>
              <option value="10월">10월</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button className="apply-filter-btn" onClick={applyFilters}>
              필터 적용하기
            </button>
            <button className="reset-filter-btn" onClick={resetFilters}>
              초기화
            </button>
          </div>
        </div>

        {/* 인기 대학 */}
        <div className="top-search-box">
          <div className="top-search-header">인기 대학</div>
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
