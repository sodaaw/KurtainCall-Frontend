import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Genre.css';
import Topnav from '../components/Topnav';
import axios from 'axios';

// === 샘플 리뷰 (기존과 동일) =========================================
const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    userName: 'Sarah Kim',
    userBadge: 'JP',
    area: 'Busan',
    activities: ['Market', 'Food', 'Local'],
    tags: ['Location', 'Local', 'Recommend'],
    rating: 5,
    lang: 'en',
    date: '2025-08-10',
    photos: [],
    content:
      'Visited a small local market near Jagalchi. Super friendly vendors and amazing street food! If you want the "real local" vibe, don\'t miss this place.',
    likes: 0,
    comments: 0,
  },
  {
    id: 'r2',
    userName: 'Minji Lee',
    userBadge: 'KR',
    area: 'Seoul',
    activities: ['Theater', 'Exhibition'],
    tags: ['Recommend'],
    rating: 4,
    lang: 'ko',
    date: '2025-08-09',
    photos: [],
    content:
      '대학로 소극장에서 본 연극이 생각보다 훨씬 좋았어요. 좌석은 좁지만 배우들 연기가 훌륭. 관람 후 인근 카페거리 산책 추천!',
    likes: 0,
    comments: 0,
  },
  {
    id: 'r3',
    userName: 'Alex Garcia',
    userBadge: 'US',
    area: 'Jeonju',
    activities: ['Food', 'Hanok'],
    tags: ['Location'],
    rating: 5,
    lang: 'en',
    date: '2025-08-07',
    photos: [],
    content:
      'Jeonju Hanok Village was beautiful. Try bibimbap at a small family-run spot off the main street. Less crowded and more authentic.',
    likes: 0,
    comments: 0,
  },
];

function ReviewCard({ review, onLikeClick, onCommentClick }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  
  const goDetail = () => navigate('/review', { state: { review } });
  const stars = '★★★★★'.slice(0, review.rating) + '☆☆☆☆☆'.slice(review.rating);
  
  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLikeClick(review.id);
    setIsLiked(true);
    
    // 애니메이션 후 상태 리셋
    setTimeout(() => setIsLiked(false), 600);
  };
  
  const handleCommentClick = (e) => {
    e.stopPropagation();
    onCommentClick(review.id);
    setIsCommented(true);
    
    // 애니메이션 후 상태 리셋
    setTimeout(() => setIsCommented(false), 600);
  };
  
  return (
    <article
      className="review-card"
      role="button"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={(e) => e.key === 'Enter' && goDetail()}
      aria-label={`Open review detail for ${review.userName}`}
      >
      <header className="review-header">
        <div className="review-user">
          <div className="review-avatar" aria-hidden />
          <div className="review-user-meta">
            <div className="review-name">
              {review.userName} <span className="review-badge">{review.userBadge}</span>
            </div>
            <div className="review-sub">
              Area: {review.area} | Activities: {review.activities.join(', ')}
            </div>
          </div>
        </div>
        <div className="review-rating" aria-label={`${review.rating} out of 5`}>
          {stars}
        </div>
      </header>

      <div className="review-body">
        <div className="review-photo">
          {review.photos?.length ? (
            <img src={review.photos[0]} alt="review" />
          ) : (
            <div className="photo-placeholder">🖼 사진 영역</div>
          )}
        </div>
        <p className="review-text">{review.content}</p>
      </div>

      <footer className="review-footer">
        <div className="review-chips">
          {review.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
        <div className="review-actions" role="group" aria-label="review actions">
          <button 
            className={`icon-btn ${isLiked ? 'liked' : ''}`}
            title="like" 
            onClick={handleLikeClick}
            aria-label={`Like this review (${review.likes} likes)`}
          >
            ♥ {review.likes}
          </button>
          <button 
            className="icon-btn" 
            title="comment" 
            onClick={handleCommentClick}
            aria-label={`Comment on this review (${review.comments} comments)`}
          >
            💬 {review.comments}
          </button>
          <button className="icon-btn" title="share">🔗 공유</button>
        </div>
      </footer>
    </article>
  );
}
// ====================================================================

const COUNTRY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'uk', label: '영국' },
  { value: 'us', label: '미국' },
  { value: 'cn', label: '중국' },
  { value: 'us', label: '일본' },
  { value: 'es', label: '스페인' },
  { value: 'de', label: '독일' },
  { value: 'kr', label: '한국' },
];

const LANG_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'en', label: '영어' },
  { value: 'es', label: '스페인어' },
  { value: 'ja', label: '일본어' },
  { value: 'zh', label: '중국어' },
  { value: 'de', label: '독일어' },
];

const Genre = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category'); // URL에서 장르

  // API 데이터 상태
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 기존 상태들
  const [current, setCurrent] = useState(0);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);

  // === 필터 상태 (요청대로 4종) =========================
  const [filters, setFilters] = useState({
    ratingSort: 'none', // 'high' | 'low'
    viewsSort: 'none',  // 'desc'
    deadlineSort: 'none', // 'urgent' | 'normal'
    priceSort: 'none',  // 'low' | 'high'
    q: '',
  });

  // See all / Filtering 토글
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'filtered'

  // API 호출 - 여러 엔드포인트 시도
  useEffect(() => {
    const fetchPlays = async () => {
      try {
        // 여러 가능한 API 엔드포인트 시도
        const possibleEndpoints = [
          '/api/play',
          '/api/plays', 
          '/api/theater',
          '/api/shows',
          '/api/movies' // 기존에 작동했던 엔드포인트
        ];
        
        let playsData = null;
        
        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`API 엔드포인트 시도: ${endpoint}`);
            const response = await axios.get(`https://re-local.onrender.com${endpoint}`);
            
            if (response.data && response.data.items) {
              playsData = response.data.items;
              console.log(`성공: ${endpoint}에서 데이터 로드됨`);
              break;
            } else if (response.data && Array.isArray(response.data)) {
              playsData = response.data;
              console.log(`성공: ${endpoint}에서 배열 데이터 로드됨`);
              break;
            }
          } catch (endpointError) {
            console.log(`${endpoint} 실패:`, endpointError.message);
            continue;
          }
        }
        
        if (playsData) {
          // API 데이터를 올바른 형식으로 변환
          const formattedPlays = playsData.map(item => ({
            id: item.id || item.movie_id || Math.random(),
            title: item.title || item.name || '제목 없음',
            category: item.category || item.genre || '카테고리 없음',
            location: item.area || item.location || item.venue || '장소 없음',
            image: item.image || '/images/event1.jpg',
            price: item.price || 0,
            rating: item.stars || item.rating || 0,
            views: item.views || 0,
            deadline: item.end_date || '마감일 없음'
          }));
          
          setPlays(formattedPlays);
          setLoading(false);
        } else {
          // 모든 API 시도 실패 시 기존 더미 데이터 사용
          console.log('모든 API 엔드포인트 실패, 더미 데이터 사용');
          const dummyPlays = [
            {
              id: 1,
              title: '웃음의 학교',
              category: 'comedy',
              location: '서울 종로구 대학로10길 11',
              image: '/images/event1.jpg',
              price: 20000,
              rating: 4.8,
              views: 150,
              deadline: '2025-08-25'
            },
            {
              id: 2,
              title: '개그맨의 밤',
              category: 'comedy',
              location: '서울 마포구 홍대로 123',
              image: '/images/event2.jpg',
              price: 25000,
              rating: 4.5,
              views: 120,
              deadline: '2025-08-30'
            },
            {
              id: 3,
              title: '즉흥 연기',
              category: 'comedy',
              location: '서울 강남구 강남대로 456',
              image: '/images/event3.jpg',
              price: 30000,
              rating: 4.7,
              views: 180,
              deadline: '2025-09-05'
            }
          ];
          
          setPlays(dummyPlays);
          setLoading(false);
        }
      } catch (error) {
        console.error('연극 데이터 로드 실패:', error);
        setLoading(false);
      }
    };
    
    fetchPlays();
  }, []);

  // (1) 카테고리 1차 필터
  const baseList = useMemo(() => {
    return category ? plays.filter((p) => p.category === category) : plays;
  }, [category, plays]);

  // (2) 상세 필터/정렬 (Filtering일 때만 적용)
  const filteredSortedList = useMemo(() => {
    let arr = [...baseList];

    // 검색어
    if (filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      arr = arr.filter((p) => {
        const hay = [p?.title, p?.location, p?.category]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' | ');
        return hay.includes(q);
      });
    }

    // 정렬: 후기 평점
    if (filters.ratingSort === 'high') {
      arr.sort((a, b) => (b?.rating ?? 0) - (a?.rating ?? 0));
    } else if (filters.ratingSort === 'low') {
      arr.sort((a, b) => (a?.rating ?? 0) - (b?.rating ?? 0));
    }

    // 정렬: 조회수 (선택 시 우선 적용)
    if (filters.viewsSort === 'desc') {
      arr.sort((a, b) => (b?.views ?? 0) - (a?.views ?? 0));
    }

    // 정렬: 마감임박순
    if (filters.deadlineSort === 'urgent') {
      arr.sort((a, b) => {
        const aUrgent = a.deadline?.includes('마감') || a.deadline?.includes('오늘') || a.deadline?.includes('이번 주');
        const bUrgent = b.deadline?.includes('마감') || b.deadline?.includes('오늘') || b.deadline?.includes('이번 주');
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;
        return 0;
      });
    }

    // 정렬: 가격순
    if (filters.priceSort === 'low') {
      arr.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
    } else if (filters.priceSort === 'high') {
      arr.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
    }

    return arr;
  }, [baseList, filters]);

  // 최종 표시 목록
  const list = viewMode === 'all' ? baseList : filteredSortedList;
  const len = list.length;

  // 캐러셀 인덱스 리셋
  useEffect(() => { setCurrent(0); }, [category, len, viewMode]);

  // 캐러셀 타이머
  useEffect(() => {
    if (len < 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % len), 5000);
    return () => clearInterval(timer);
  }, [len]);

  const visiblePosters = len
    ? [list[current % len], list[(current + 1) % len], list[(current + 2) % len]].filter(Boolean)
    : [];

  // 이벤트 핸들러
  const onChange = (key) => (e) => {
    const value = e.target.value;
    setFilters((prev) => {
      // 조회수 정렬을 선택하면 평점 정렬 초기화(우선순위 충돌 방지)
      if (key === 'viewsSort' && value === 'desc') {
        return { ...prev, [key]: value, ratingSort: 'none' };
      }
      return { ...prev, [key]: value };
    });
  };
  const onSearch = () => setFilters((prev) => ({ ...prev, q: prev.q.trim() }));

  const resetToAll = () => {
    setViewMode('all');
    setFilters({ 
      ratingSort: 'none', 
      viewsSort: 'none', 
      deadlineSort: 'none',
      priceSort: 'none',
      q: '' 
    });
  };

  // 리뷰는 언어 필터만 가볍게 연동 (그 외는 기존 그대로)
  const filteredReviews = reviews;
  
  // 하트 클릭 핸들러
  const handleLikeClick = (reviewId) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes + 1 }
          : review
      )
    );
  };
  
  // 댓글 클릭 핸들러
  const handleCommentClick = (reviewId) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, comments: review.comments + 1 }
          : review
      )
    );
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="genre-container">
        <Topnav />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Loading...</h2>
          <p>연극 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="genre-container">
      <Topnav />

      <h2 className="genre-title">
        Recommendation For U
        <span className="genre-subtitle">* 테스트를 진행하면 맞춤 추천결과를 볼 수 있습니다.</span>
        <button 
          className="test-button"
          onClick={() => navigate('/test/my-test')}
        >
          Test
        </button>
      </h2>
      {category && <span className="category-chip">{category}</span>}

      {/* ===== 포스터 섹션 (위) ===== */}
      {len === 0 ? (
        <div style={{ opacity: 0.7, padding: '24px 0' }}>조건에 맞는 결과가 없습니다.</div>
      ) : (
        <section className="poster-section carousel">
          {visiblePosters.map((p) => (
            <div 
              key={p.id} 
              className="poster-card-mine"
              onClick={() => navigate('/genre/recommended', { state: { selectedPoster: p } })}
              style={{ cursor: 'pointer' }}
            >
              <img src={p.image} alt={p.title} className="poster-img-mine" />
              <div className="poster-title">{p.title}</div>
              <div className="poster-info">
                {p.category} {p.location && `| ${p.location}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===== 필터 박스 ===== */}
      <section className="filter-wrap">
        <div className="filter-title">Filter</div>

        <div className="filter-grid">
          {/* 평점순 */}
          <div className="filter-item">
            <label>Rating</label>
            <select
              className="filter-select"
              value={filters.ratingSort}
              onChange={onChange('ratingSort')}
            >
              <option value="none">Sort None</option>
              <option value="high">High Rating</option>
              <option value="low">Low Rating</option>
            </select>
          </div>

          {/* 조회수 */}
          <div className="filter-item">
            <label>Views</label>
            <select
              className="filter-select"
              value={filters.viewsSort}
              onChange={onChange('viewsSort')}
            >
              <option value="none">Sort None</option>
              <option value="desc">High Views</option>
            </select>
          </div>

          {/* 마감임박순 */}
          <div className="filter-item">
            <label>Deadline</label>
            <select
              className="filter-select"
              value={filters.deadlineSort}
              onChange={onChange('deadlineSort')}
            >
              <option value="none">Sort None</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* 낮은가격순 */}
          <div className="filter-item">
            <label>Price</label>
            <select
              className="filter-select"
              value={filters.priceSort}
              onChange={onChange('priceSort')}
            >
              <option value="none">Sort None</option>
              <option value="low">Low Price</option>
              <option value="high">High Price</option>
            </select>
          </div>
        </div>

        {/* 검색창은 유지 */}
        <div className="filter-search-row">
          <input
            type="text"
            placeholder="Title·Location Search"
            value={filters.q}
            onChange={onChange('q')}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <button className="btn-primary" onClick={onSearch}>
            Search
          </button>
        </div>
      </section>

      {/* ===== 보기 모드 토글 (필터 아래 / 리뷰 위) ===== */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={resetToAll}
        >
          See all
        </button>
        <button
          className={`mode-btn ${viewMode === 'filtered' ? 'active' : ''}`}
          onClick={() => setViewMode('filtered')}
        >
          Filtering
        </button>
        <span className="mode-info">
          {viewMode === 'all' ? `Total ${baseList.length} items` : `Filtered ${filteredSortedList.length} items`}
        </span>
      </div>

{/* ===== 리뷰 섹션 ===== */}
<section className="review-wrap">
  <div className="review-title-row">
    <h3>Results</h3> {/* ← 여기 변경 */}
    <span className="review-count">{filteredReviews.length} items</span>
  </div>

  <div className="review-list">
    {filteredReviews.map((r) => (
      <ReviewCard 
        key={r.id} 
        review={r} 
        onLikeClick={handleLikeClick}
        onCommentClick={handleCommentClick}
      />
    ))}
  </div>
</section>
    </div>
  );
};

export default Genre;
