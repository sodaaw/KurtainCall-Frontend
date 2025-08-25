import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Genre.css';

/** 객체/숫자/문자 무엇이 와도 안전하게 문자열로 변환 */
const asText = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);

  if (typeof v === 'object') {
    if (v.address) {
      const a = v.address;
      if (typeof a === 'string') return a;
      if (typeof a === 'object') {
        return (
          a.road ||
          a.address_name ||
          a.value ||
          [a.city, a.district, a.street, a.detail].filter(Boolean).join(' ') ||
          fallback
        );
      }
    }
    return (
      v.name ||
      v.title ||
      v.label ||
      Object.values(v).find((x) => typeof x === 'string') ||
      fallback
    );
  }
  return fallback;
};

const AllPosters = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const response = await axios.get('https://re-local.onrender.com/api/play');

        if (response.data && response.data.items) {
          const playsData = response.data.items;

          // API -> 포스터 포맷
          const formattedPosters = playsData.map((item) => ({
            id: item.id || item.movie_id || Math.random(),
            title: asText(item.title) || asText(item.name) || '제목 없음',
            category: asText(item.category) || asText(item.genre) || '카테고리 없음',
            location:
              asText(item.area) || asText(item.location) || asText(item.venue) || '장소 없음',
            image: item.posterUrl || item.image || '/images/event1.jpg',
            price: Number(item.price) || 0,
            rating: Number(item.stars ?? item.rating) || 0,
          }));

          setPosters(formattedPosters);
          setLoading(false);
        } else {
          setPosters([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('포스터 데이터 로드 실패:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  if (loading) {
    return (
      <div className="genre-container">
        <h2>All Posters</h2>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h3>Loading...</h3>
          <p>포스터 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genre-container">
        <h2>All Posters</h2>
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#ff6b6b' }}>
          <h3>Error</h3>
          <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
        </div>
      </div>
    );
  }

  if (posters.length === 0) {
    return (
      <div className="genre-container">
        <h2>All Posters</h2>
        <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.7 }}>
          <h3>No Posters Found</h3>
          <p>표시할 포스터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="genre-container">
      <h2>All Posters</h2>
      <section className="poster-section grid-all">
        {posters.map((p) => (
          <div key={p.id} className="poster-card">
            <img src={p.image} alt={asText(p.title, '제목')} className="poster-img" />
            <h4>{asText(p.title, '제목 없음')}</h4>
            <p>
              {asText(p.category)} | {asText(p.location)}
            </p>
            {p.price > 0 && (
              <p className="poster-price">₩{Number(p.price).toLocaleString()}</p>
            )}
            {p.rating > 0 && <p className="poster-rating">★ {p.rating}</p>}
          </div>
        ))}
      </section>
    </div>
  );
};

export default AllPosters;
