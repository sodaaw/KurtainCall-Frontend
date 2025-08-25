import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Genre.css';

const AllPosters = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        console.log('백엔드 API에서 모든 포스터 데이터를 가져오는 중...');
        const response = await axios.get('https://re-local.onrender.com/api/play');
        
        if (response.data && response.data.items) {
          const playsData = response.data.items;
          console.log('백엔드 API에서 데이터 로드 성공:', playsData.length, '개 항목');
          
          // API 데이터를 포스터 형식으로 변환
          const formattedPosters = playsData.map(item => ({
            id: item.id || item.movie_id || Math.random(),
            title: item.title || item.name || '제목 없음',
            category: item.category || item.genre || '카테고리 없음',
            location: item.area || item.location || item.venue || '장소 없음',
            image: item.posterUrl || item.image || '/images/event1.jpg',
            price: item.price || 0,
            rating: item.stars || item.rating || 0
          }));
          
          setPosters(formattedPosters);
          setLoading(false);
        } else {
          console.log('백엔드 API에서 데이터를 가져올 수 없습니다.');
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
        {posters.map(p => (
          <div key={p.id} className="poster-card">
            <img src={p.image} alt={p.title} className="poster-img" />
            <h4>{p.title}</h4>
            <p>{p.category} | {p.location}</p>
            {p.price && <p className="poster-price">₩{p.price.toLocaleString()}</p>}
            {p.rating && <p className="poster-rating">★ {p.rating}</p>}
          </div>
        ))}
      </section>
    </div>
  );
};

export default AllPosters;
