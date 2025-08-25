import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Genre.css';
import Topnav from '../components/Topnav';
import axios from 'axios';

/** 객체/숫자/문자 무엇이 와도 안전하게 문자열로 변환 */
const asText = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);

  if (typeof v === 'object') {
    // 주소/장소 형태 대응
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

// === 샘플 리뷰 =========================================
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
    setTimeout(() => setIsLiked(false), 600);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    onCommentClick(review.id);
    setIsCommented(true);
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
            <img referrerPolicy="no-referrer" src={review.photos[0]} alt="review" />
            
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

// === 옵션 (현재 미사용) =================================
const COUNTRY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'uk', label: '영국' },
  { value: 'us', label: '미국' },
  { value: 'cn', label: '중국' },
  { value: 'jp', label: '일본' },
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

  // 카테고리별 포스터 데이터
  const [categoryPlays, setCategoryPlays] = useState({
    comedy: [],
    romance: [],
    horror: [],
    thriller: [],
    musical: [],
    drama: [],
  });

  // 기존 상태들
  const [current, setCurrent] = useState(0);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);

  // === 필터 상태 =========================
  const [filters, setFilters] = useState({
    ratingSort: 'none', // 'high' | 'low'
    viewsSort: 'none',  // 'desc'
    deadlineSort: 'none', // 'urgent' | 'normal'
    priceSort: 'none',  // 'low' | 'high'
    q: '',
  });

  // See all / Filtering 토글
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'filtered'

  // 백엔드 API 호출
  useEffect(() => {
    const fetchPlays = async () => {
      try {
        const response = await axios.get('https://re-local.onrender.com/api/play');

        if (response.data && response.data.items) {
          const playsData = response.data.items;

          // API -> 내부 포맷
          const formattedPlays = playsData.map((item) => ({
            id: item.id || item.movie_id || Math.random(),
            title: asText(item.title) || asText(item.name) || '제목 없음',
            category: asText(item.category) || asText(item.genre) || '카테고리 없음',
            location:
              asText(item.area) || asText(item.location) || asText(item.venue) || '장소 없음',
            image: item.posterUrl || item.image || '/images/event1.jpg',
            price: Number(item.price) || 0,
            rating: Number(item.stars ?? item.rating) || 0,
            views: Number(item.views) || 0,
            deadline: asText(item.end_date) || '마감일 없음',
          }));

          // 카테고리별 분류
          const categorized = {
            comedy: [],
            romance: [],
            horror: [],
            thriller: [],
            musical: [],
            drama: [],
          };

          formattedPlays.forEach((play) => {
            const playCategory = String(play.category || '').toLowerCase();
            if (categorized[playCategory]) {
              categorized[playCategory].push(play);
            } else if (playCategory.includes('comedy') || playCategory.includes('코미디')) {
              categorized.comedy.push(play);
            } else if (playCategory.includes('romance') || playCategory.includes('로맨스')) {
              categorized.romance.push(play);
            } else if (playCategory.includes('horror') || playCategory.includes('공포')) {
              categorized.horror.push(play);
            } else if (playCategory.includes('thriller') || playCategory.includes('스릴러')) {
              categorized.thriller.push(play);
            } else if (playCategory.includes('musical') || playCategory.includes('뮤지컬')) {
              categorized.musical.push(play);
            } else {
              categorized.drama.push(play);
            }
          });

          setCategoryPlays(categorized);
          setPlays(formattedPlays);
          setLoading(false);
        } else {
          setCategoryPlays({
            comedy: [],
            romance: [],
            horror: [],
            thriller: [],
            musical: [],
            drama: [],
          });
          setPlays([]);
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

    // 정렬: 조회수
    if (filters.viewsSort === 'desc') {
      arr.sort((a, b) => (b?.views ?? 0) - (a?.views ?? 0));
    }

    // 정렬: 마감임박순 (간단 키워드)
    if (filters.deadlineSort === 'urgent') {
      arr.sort((a, b) => {
        const aUrgent =
          a.deadline?.includes('마감') ||
          a.deadline?.includes('오늘') ||
          a.deadline?.includes('이번 주');
        const bUrgent =
          b.deadline?.includes('마감') ||
          b.deadline?.includes('오늘') ||
          b.deadline?.includes('이번 주');
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
  useEffect(() => {
    setCurrent(0);
  }, [category, len, viewMode]);

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
      q: '',
    });
  };

  // 리뷰 필터(간단)
  const filteredReviews = reviews;

  // 하트/댓글 핸들러
  const handleLikeClick = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, likes: review.likes + 1 } : review
      )
    );
  };
  const handleCommentClick = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, comments: review.comments + 1 } : review
      )
    );
  };

  // 로딩 상태
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

      <h2 className="genre-title">{category ? `${category} Events` : 'All Events'}</h2>
      {category && <span className="category-chip">{category}</span>}

      {/* ===== 현재 카테고리 포스터 섹션 ===== */}
      {category ? (
        <section className="category-posters-section">
          <h3 className="section-title">{category} Posters</h3>

          <div className="category-group">
            <h4 className="category-title">{category}</h4>
            <div className="poster-grid">
              {categoryPlays[category.toLowerCase()]?.slice(0, 12).map((play) => (
                <div
                  key={play.id}
                  className="category-poster-card"
                  onClick={() =>
                    navigate('/genre/recommended', { state: { selectedPoster: play } })
                  }
                >
                  <img src={play.image} alt={asText(play.title, '제목')} className="category-poster-img" />
                  <div className="category-poster-info">
                    <h5 className="category-poster-title">{asText(play.title, '제목 없음')}</h5>
                    <p className="category-poster-location">
                      {asText(play.location, '장소 없음')}
                    </p>
                    <p className="category-poster-price">
                      ₩{Number(play.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div
                  style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', opacity: 0.7 }}
                >
                  <p>이 카테고리에 해당하는 포스터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="category-posters-section">
          <h3 className="section-title">All Category Posters</h3>

          {/* 코미디 */}
          <div className="category-group">
            <h4 className="category-title">Comedy</h4>
            <div className="poster-grid">
              {categoryPlays.comedy.slice(0, 6).map((play) => (
                <div
                  key={play.id}
                  className="category-poster-card"
                  onClick={() =>
                    navigate('/genre/recommended', { state: { selectedPoster: play } })
                  }
                >
                  <img src={play.image} alt={asText(play.title, '제목')} className="category-poster-img" />
                  <div className="category-poster-info">
                    <h5 className="category-poster-title">{asText(play.title, '제목 없음')}</h5>
                    <p className="category-poster-location">{asText(play.location, '장소 없음')}</p>
                    <p className="category-poster-price">₩{Number(play.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 로맨스 */}
          <div className="category-group">
            <h4 className="category-title">Romance</h4>
            <div className="poster-grid">
              {categoryPlays.romance.slice(0, 6).map((play) => (
                <div
                  key={play.id}
                  className="category-poster-card"
                  onClick={() =>
                    navigate('/genre/recommended', { state: { selectedPoster: play } })
                  }
                >
                  <img src={play.image} alt={asText(play.title, '제목')} className="category-poster-img" />
                  <div className="category-poster-info">
                    <h5 className="category-poster-title">{asText(play.title, '제목 없음')}</h5>
                    <p className="category-poster-location">{asText(play.location, '장소 없음')}</p>
                    <p className="category-poster-price">₩{Number(play.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 뮤지컬 */}
          <div className="category-group">
            <h4 className="category-title">Musical</h4>
            <div className="poster-grid">
              {categoryPlays.musical.slice(0, 6).map((play) => (
                <div
                  key={play.id}
                  className="category-poster-card"
                  onClick={() =>
                    navigate('/genre/recommended', { state: { selectedPoster: play } })
                  }
                >
                  <img src={play.image} alt={asText(play.title, '제목')} className="category-poster-img" />
                  <div className="category-poster-info">
                    <h5 className="category-poster-title">{asText(play.title, '제목 없음')}</h5>
                    <p className="category-poster-location">{asText(play.location, '장소 없음')}</p>
                    <p className="category-poster-price">₩{Number(play.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 드라마 */}
          <div className="category-group">
            <h4 className="category-title">Drama</h4>
            <div className="poster-grid">
              {categoryPlays.drama.slice(0, 6).map((play) => (
                <div
                  key={play.id}
                  className="category-poster-card"
                  onClick={() =>
                    navigate('/genre/recommended', { state: { selectedPoster: play } })
                  }
                >
                  <img src={play.image} alt={asText(play.title, '제목')} className="category-poster-img" />
                  <div className="category-poster-info">
                    <h5 className="category-poster-title">{asText(play.title, '제목 없음')}</h5>
                    <p className="category-poster-location">{asText(play.location, '장소 없음')}</p>
                    <p className="category-poster-price">₩{Number(play.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 기존 포스터 캐러셀 ===== */}
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
              <img src={p.image} alt={asText(p.title, '제목')} className="poster-img-mine" />
              <div className="poster-title">{asText(p.title, '제목 없음')}</div>
              <div className="category-poster-info">
                {asText(p.category)} {p.location && `| ${asText(p.location)}`}
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

          {/* 가격 */}
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

        {/* 검색 */}
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

      {/* ===== 보기 모드 토글 ===== */}
      <div className="mode-toggle">
        <button className={`mode-btn ${viewMode === 'all' ? 'active' : ''}`} onClick={resetToAll}>
          See all
        </button>
        <button
          className={`mode-btn ${viewMode === 'filtered' ? 'active' : ''}`}
          onClick={() => setViewMode('filtered')}
        >
          Filtering
        </button>
        <span className="mode-info">
          {viewMode === 'all'
            ? `Total ${baseList.length} items`
            : `Filtered ${filteredSortedList.length} items`}
        </span>
      </div>

      {/* ===== 리뷰 섹션 ===== */}
      <section className="review-wrap">
        <div className="review-title-row">
          <h3>Results</h3>
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
