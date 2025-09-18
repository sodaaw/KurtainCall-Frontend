// src/components/SearchResults.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAPI } from "../services/search";
import { festivals } from "../data/festivals";
import './SearchResults.css';

const API_BASE = 'https://re-local.onrender.com';

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get("q") || "").trim();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError("");
    
    try {
      // 축제 데이터에서 검색
      const searchTerm = q.toLowerCase();
      const filteredFestivals = festivals.filter(festival => {
        return (
          festival.title?.toLowerCase().includes(searchTerm) ||
          festival.university?.toLowerCase().includes(searchTerm) ||
          festival.location?.address?.toLowerCase().includes(searchTerm) ||
          festival.description?.toLowerCase().includes(searchTerm)
        );
      });
      
      // 축제 데이터를 검색 결과 형식으로 변환
      const searchResults = filteredFestivals.map(festival => ({
        id: festival.id,
        title: festival.title,
        posterUrl: festival.posterUrl,
        detailUrl: festival.detailUrl,
        category: '축제',
        location: {
          address: festival.location.address,
          areaName: festival.university
        }
      }));
      
      setItems(searchResults);
      setLoading(false);
    } catch (error) {
      console.error('축제 검색 실패:', error);
      setError("검색 중 오류가 발생했습니다.");
      setItems([]);
      setLoading(false);
    }
  }, [q]);

  // 하이라이트(간단)
  const esc = (s="") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mark = (text="") => {
    if (!q) return text;
    const rx = new RegExp(`(${esc(q)})`, "ig");
    return String(text).split(rx).map((part, i) =>
      i % 2 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
    );
  };

  const onBack = () => navigate(-1);

  return (
    <main className="search-results-page">
      <header className="results-header">
        <button onClick={onBack}>← 뒤로</button>
        <h1>“{q}” 검색 결과</h1>
      </header>

      {loading && <p>검색 중…</p>}
      {error && <p style={{color:'#f66'}}>오류: {error}</p>}
      {!loading && !q && <p>검색어를 입력해주세요.</p>}
      {!loading && q && items.length === 0 && <p>검색 결과가 없습니다.</p>}

      <ul className="results-grid">
        {items.map((it) => {
          const img = `${API_BASE}/image-proxy?url=${encodeURIComponent(it.posterUrl||"")}&ref=${encodeURIComponent(it.detailUrl||"")}`;
          return (
            <li key={it.detailUrl || it._id} className="result-card">
              <a href={it.detailUrl} target="_blank" rel="noreferrer">
              <img
                src={it.posterUrl}
                alt={it.title}
                className="poster-img"
                loading="lazy"
                onError={(e)=>{ e.currentTarget.src='/images/fallback.jpg'; }}
              />
                <div className="meta">
                  <h3>{mark(it.title)}</h3>
                  <p>
                    <span>{it.category}</span> ·{" "}
                    <span>{it.location?.areaName}</span>
                  </p>
                  <p className="address">{mark(it.location?.address || "")}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
