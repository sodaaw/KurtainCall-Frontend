import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Genre.css';
import Topnav from '../components/Topnav';
import RecommendedPlaces from '../components/RecommendedPlaces';
// import { festivals } from '../data/festivals'; // 제거됨
import { playAPI } from '../services/api';
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
            <div className="review-name-row">
              <span className="review-name">{review.userName}</span>
              <span className="review-badge">{review.userBadge}</span>
            </div>
            <div className="review-rating">{stars}</div>
          </div>
        </div>
      </header>

      <p className="review-text">{review.content}</p>

      <footer className="review-footer">
        <div className="review-chips">
          {review.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
        <div className="review-actions" role="group" aria-label="리뷰 액션">
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
  const urlCategory = searchParams.get('category'); // URL에서 장르

  // 로컬 장르 상태 추가
  const [selectedGenre, setSelectedGenre] = useState(urlCategory || null);

  // API 데이터 상태
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 기존 상태들
  const [current, setCurrent] = useState(0);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);

  // === 필터 상태 (가격 제외) =========================
  const [filters, setFilters] = useState({
    ratingSort: 'none', // 'high' | 'low'
    viewsSort: 'none',  // 'desc'
    deadlineSort: 'none', // 'urgent' | 'normal'
    q: '',
  });

  // See all / Filtering 토글 - 제거됨
  // const [viewMode, setViewMode] = useState('all'); // 'all' | 'filtered'

  // === 새로운 탭 상태 추가 =========================
  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'plays'

  // URL 카테고리 변경 시 로컬 상태 동기화
  useEffect(() => {
    setSelectedGenre(urlCategory);
  }, [urlCategory]);

  // 장르 변경 핸들러
  const handleGenreChange = (genre) => {
    if (genre === null) {
      setSelectedGenre(null);
      navigate('/genre');
    } else {
      setSelectedGenre(genre);
      navigate(`/genre?category=${genre}`);
    }
  };

  // 연극 데이터 로드 (API 우선, 실패 시 축제 데이터 폴백)
  useEffect(() => {
    const loadPlays = async () => {
      try {
        setLoading(true);
        
        // API에서 연극 데이터 가져오기
        const apiPlays = await playAPI.getPlays();
        console.log('API에서 받은 연극 데이터:', apiPlays);
        
        // API 데이터를 plays 형식으로 변환
        const formattedPlays = apiPlays.map(play => ({
          id: play.id,
          title: play.title,
          category: play.category || '기타',
          location: play.location?.address || play.location,
          image: play.posterUrl || play.image,
          price: play.price || 0,
          rating: play.rating || (4.5 + Math.random() * 0.5),
          views: play.views || Math.floor(Math.random() * 200) + 50,
          deadline: play.date,
          university: play.university,
          performers: play.performers,
          description: play.description
        }));
        
        console.log('API 연극 데이터 로드됨:', formattedPlays.length, '개');
        setPlays(formattedPlays);
        setLoading(false);
      } catch (error) {
        console.error('API 연극 데이터 로드 실패:', error);
        
        // API 실패 시 빈 배열로 설정
        console.log('API 실패, 빈 배열로 설정');
        setPlays([]);
        setLoading(false);
      }
    };

    loadPlays();
  }, []);

  // (1) 카테고리 1차 필터
  const baseList = useMemo(() => {
    if (!selectedGenre) return plays;
    
    // 공포/스릴러 통합 처리
    if (selectedGenre === 'horror') {
      return plays.filter((p) => {
        const category = (p.category || '').toLowerCase();
        return category === 'horror' || category === 'thriller';
      });
    }
    
    return plays.filter((p) => (p.category || '').toLowerCase() === selectedGenre.toLowerCase());
  }, [selectedGenre, plays]);


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


    return arr;
  }, [baseList, filters]);

  // 최종 표시 목록
  const list = baseList; // viewMode === 'all' ? baseList : filteredSortedList;
  const len = list.length;

  // 장르별로 그룹화
  const groupedPlays = useMemo(() => {
    const groups = {};
    list.forEach(play => {
      const genre = play.category || '기타';
      if (!groups[genre]) {
        groups[genre] = [];
      }
      groups[genre].push(play);
    });
    return groups;
  }, [list]);

  // 캐러셀 인덱스 리셋
  useEffect(() => { setCurrent(0); }, [selectedGenre, len]);

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
    setSelectedGenre(null);
    navigate('/genre');
    setFilters({ 
      ratingSort: 'none', 
      viewsSort: 'none', 
      deadlineSort: 'none',
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

      {/* <h2 className="genre-title">
        {category ? `${category} 이벤트` : '전체 카테고리'}
      </h2> */}

      {/* ===== 탭 네비게이션 추가 ===== */}
      <div className="genre-tabs">
        <button
          className={`genre-tab ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          📍 추천 장소 보기
        </button>
        <button
          className={`genre-tab ${activeTab === 'plays' ? 'active' : ''}`}
          onClick={() => setActiveTab('plays')}
        >
          🎭 추천 연극 보기
        </button>
      </div>

      {/* ===== 탭별 컨텐츠 ===== */}
      {activeTab === 'places' && (
        <>
          {/* ✅ 추천 장소 섹션 */}
          <RecommendedPlaces 
            genre={selectedGenre}
            title={`📍 ${selectedGenre ? selectedGenre + ' 관련 추천 장소' : '근처 추천 장소'}`}
            limit={10}
          />
        </>
      )}

      {activeTab === 'plays' && (
        <>
          {/* ✅ 추천 연극 섹션 */}
          <section className="genre-plays-section">
            <h3 className="plays-section-title">🎭 {selectedGenre ? selectedGenre + ' 관련 연극' : '근처 연극 정보'}</h3>
            <div className="plays-grid">
              {loading ? (
                <div className="plays-loading">
                  <div className="loading-spinner"></div>
                  <p>연극 정보를 불러오는 중...</p>
                </div>
              ) : error || !plays || plays.length === 0 ? (
                <div className="plays-empty">
                  <div className="empty-icon">🎭</div>
                  <p>연극 정보를 불러올 수 없습니다.</p>
                </div>
              ) : (
                plays.slice(0, 12).map((play) => (
                  <div key={play.id} className="play-card">
                    <div className="play-image-container">
                      {play.image ? (
                        <img
                          src={play.image}
                          alt={play.title}
                          className="play-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="play-emoji-container">
                          <div className="play-emoji">🎭</div>
                        </div>
                      )}
                    </div>
                    <div className="play-info">
                      <h4 className="play-title">{play.title}</h4>
                      {play.location && (
                        <p className="play-location">
                          {typeof play.location === 'string' 
                            ? play.location 
                            : play.location.address || play.location}
                        </p>
                      )}
                      {play.deadline && (
                        <p className="play-date">{play.deadline}</p>
                      )}
                      {play.university && (
                        <p className="play-university">{play.university}</p>
                      )}
                      {play.price !== undefined && (
                        <p className="play-price">
                          {play.price === 0 ? '무료' : `${play.price}원`}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

    </div>
  );
};

export default Genre;
