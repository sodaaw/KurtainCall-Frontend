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

  // See all / Filtering 토글 - 제거됨
  // const [viewMode, setViewMode] = useState('all'); // 'all' | 'filtered'

  // === 새로운 탭 상태 추가 =========================
  const [activeTab, setActiveTab] = useState('posters'); // 'posters' | 'reviews'

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
          // API 응답 데이터 로깅 (디버깅용)
          console.log('API 원본 데이터 샘플:', playsData[0]);
          
          // API 데이터를 올바른 형식으로 변환
          const formattedPlays = playsData.map(item => {
            // 가격 정보 매핑 - 여러 가능한 필드명 시도
            let price = item.price || item.ticketPrice || item.ticket_price || item.cost || item.fee;
            
            // 가격이 숫자가 아니거나 0이면 기본값 사용
            if (!price || isNaN(price) || price <= 0) {
              price = 15000; // 더 현실적인 기본 가격
            }
            
            return {
              id: item.id || item.movie_id || Math.random(),
              title: item.title || item.name || '제목 없음',
              category: item.category || item.genre || '카테고리 없음',
              location: item.area || item.location || item.venue || '장소 없음',
              image: item.posterUrl || item.image || '/images/fallback.jpg',
              price: price,
              rating: item.stars || item.rating || 0,
              views: item.views || 0,
              deadline: item.end_date || '마감일 없음'
            };
          });
          
          console.log('변환된 데이터 샘플:', formattedPlays[0]);
          
          setPlays(formattedPlays);
          setLoading(false);
        } else {
          // 모든 API 시도 실패 시 확장된 더미 데이터 사용
          console.log('모든 API 엔드포인트 실패, 확장된 더미 데이터 사용');
          const allDummyPlays = [
            {
              id: 1,
              title: '뱀프 X 헌터',
              category: 'comedy',
              location: '서울 종로구 동숭길 94, JS...',
              image: '/images/event1.jpg',
              price: 20000,
              rating: 4.8,
              views: 150,
              deadline: '2025-08-25'
            },
            {
              id: 2,
              title: '죽여주는 이야기',
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
              title: '과속스캔들',
              category: 'comedy',
              location: '서울 강남구 강남대로 456',
              image: '/images/event3.jpg',
              price: 30000,
              rating: 4.7,
              views: 180,
              deadline: '2025-09-05'
            },
            {
              id: 4,
              title: '라면',
              category: 'comedy',
              location: '서울 서초구 서초대로 789',
              image: '/images/event4.jpg',
              price: 18000,
              rating: 4.3,
              views: 90,
              deadline: '2025-09-10'
            },
            {
              id: 5,
              title: '2호선 세입자',
              category: 'comedy',
              location: '서울 중구 세종대로 123',
              image: '/images/event5.jpg',
              price: 35000,
              rating: 4.9,
              views: 200,
              deadline: '2025-08-27'
            },
            {
              id: 6,
              title: '너의 목소리가 들려',
              category: 'comedy',
              location: '서울 종로구 대학로 456',
              image: '/images/event1.jpg',
              price: 28000,
              rating: 4.6,
              views: 160,
              deadline: '2025-09-02'
            },
            {
              id: 7,
              title: '한뼘사이',
              category: 'romance',
              location: '서울 강남구 테헤란로 789',
              image: '/images/event2.jpg',
              price: 40000,
              rating: 4.8,
              views: 180,
              deadline: '2025-09-07'
            },
            {
              id: 8,
              title: '사내연애 보고서',
              category: 'romance',
              location: '서울 마포구 와우산로 321',
              image: '/images/event3.jpg',
              price: 32000,
              rating: 4.4,
              views: 140,
              deadline: '2025-09-12'
            },
            {
              id: 9,
              title: '핫식스',
              category: 'romance',
              location: '서울 강남구 논현로 123',
              image: '/images/event4.jpg',
              price: 22000,
              rating: 4.2,
              views: 110,
              deadline: '2025-08-28'
            },
            {
              id: 10,
              title: '김종욱 찾기',
              category: 'romance',
              location: '서울 서초구 강남대로 456',
              image: '/images/event5.jpg',
              price: 28000,
              rating: 4.5,
              views: 130,
              deadline: '2025-09-01'
            },
            {
              id: 11,
              title: '나의 PS 파트너',
              category: 'romance',
              location: '서울 중구 을지로 789',
              image: '/images/event1.jpg',
              price: 45000,
              rating: 4.9,
              views: 220,
              deadline: '2025-09-15'
            },
            {
              id: 12,
              title: '공포의 밤',
              category: 'horror',
              location: '서울 종로구 인사동길 123',
              image: '/images/event2.jpg',
              price: 50000,
              rating: 4.7,
              views: 190,
              deadline: '2025-09-20'
            },
            {
              id: 13,
              title: '스릴러 극장',
              category: 'thriller',
              location: '서울 강남구 테헤란로 456',
              image: '/images/event3.jpg',
              price: 38000,
              rating: 4.6,
              views: 170,
              deadline: '2025-09-25'
            },
            {
              id: 14,
              title: '뮤지컬 나이트',
              category: 'musical',
              location: '서울 중구 을지로 789',
              image: '/images/event4.jpg',
              price: 45000,
              rating: 4.9,
              views: 220,
              deadline: '2025-09-15'
            },
            {
              id: 15,
              title: '오페라 하우스',
              category: 'musical',
              location: '서울 종로구 인사동길 123',
              image: '/images/event5.jpg',
              price: 50000,
              rating: 4.7,
              views: 190,
              deadline: '2025-09-20'
            }
          ];
          
          setPlays(allDummyPlays);
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
    return selectedGenre 
      ? plays.filter((p) => (p.category || '').toLowerCase() === selectedGenre.toLowerCase())
      : plays;
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

    // 정렬: 가격순
    if (filters.priceSort === 'low') {
      arr.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
    } else if (filters.priceSort === 'high') {
      arr.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
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

      {/* <h2 className="genre-title">
        {category ? `${category} 이벤트` : '전체 카테고리'}
      </h2> */}
      {selectedGenre && <span className="category-chip">{selectedGenre}</span>}

      {/* ===== 탭 네비게이션 추가 ===== */}
      <div className="genre-tabs">
        <button
          className={`genre-tab ${activeTab === 'posters' ? 'active' : ''}`}
          onClick={() => setActiveTab('posters')}
        >
          🎭 포스터 보기
        </button>
        <button
          className={`genre-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          💬 리뷰 보기
        </button>
      </div>

      {/* ===== 탭별 컨텐츠 ===== */}
      {activeTab === 'posters' && (
        <>
          {/* ===== 장르별 필터링 버튼들 ===== */}
          <div className="genre-filter-buttons">
            <button
              className={`genre-filter-btn ${selectedGenre === null ? 'active' : ''}`}
              onClick={() => handleGenreChange(null)}
            >
              전체
            </button>
            <button
              className={`genre-filter-btn ${selectedGenre === 'comedy' ? 'active' : ''}`}
              onClick={() => handleGenreChange('comedy'.toLowerCase())}
            >
              코미디
            </button>
            <button
              className={`genre-filter-btn ${selectedGenre === 'romance' ? 'active' : ''}`}
              onClick={() => handleGenreChange('romance'.toLowerCase())}
            >
              로맨스
            </button>
            <button
              className={`genre-filter-btn ${selectedGenre === 'horror' ? 'active' : ''}`}
              onClick={() => handleGenreChange('horror')}
            >
              공포
            </button>
            <button
              className={`genre-filter-btn ${selectedGenre === 'thriller' ? 'active' : ''}`}
              onClick={() => handleGenreChange('thriller'.toLowerCase())}
            >
              스릴러
            </button>
            <button
              className={`genre-filter-btn ${selectedGenre === 'musical' ? 'active' : ''}`}
              onClick={() => handleGenreChange('musical'.toLowerCase())}
            >
              뮤지컬
            </button>
          </div>

          {/* ===== 장르별 포스터 섹션 ===== */}
          {len === 0 ? (
            <div style={{ opacity: 0.7, padding: '24px 0' }}>조건에 맞는 결과가 없습니다.</div>
          ) : (
            <div className="category-posters-section">
              {Object.entries(groupedPlays).map(([genre, genrePlays]) => (
                <div key={genre} className="category-group">
                  <h4 className="category-title">{genre}</h4>
                  <div className="poster-grid">
                    {genrePlays.map((play) => (
                      <div 
                        key={play.id} 
                        className="category-poster-card"
                        onClick={() => navigate('/genre/recommended', { state: { selectedPoster: play } })}
                      >
                        <img
                          referrerPolicy="no-referrer"
                          src={play.image}
                          alt={play.title}
                          className="category-poster-img"
                          onError={(e) => { 
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/fallback.jpg'; 
                          }}
                        />
                        <div className="category-poster-info">
                          <div className="category-poster-title">{play.title}</div>
                          <div className="category-poster-location">
                            {typeof play.location === 'string' 
                              ? play.location 
                              : play.location?.address || '장소 정보 없음'
                            }
                          </div>
                          <div className="category-poster-price">₩{play.price?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'reviews' && (
        <div className="reviews-full-section">
          {/* ===== 리뷰 섹션 전체 화면 ===== */}
          <div className="review-title-row">
            <h3>Community Reviews</h3> 
            <span className="review-count">{filteredReviews.length} items</span>
          </div>

          <div className="review-list-full">
            {filteredReviews.map((r) => (
              <ReviewCard 
                key={r.id} 
                review={r} 
                onLikeClick={handleLikeClick}
                onCommentClick={handleCommentClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== 데스크탑 2컬럼 병렬 레이아웃 (리뷰 보기 탭에서만 표시) ===== */}
      {activeTab === 'reviews' && (
        <div className="desktop-parallel-layout">
          <div className="parallel-left">
            {/* ===== 필터 박스 ===== */}
            <section className="filter-wrap">
              <div className="filter-title">필터</div>

              <div className="filter-grid">
                {/* 평점순 */}
                <div className="filter-item">
                  <label>Rating</label>
                  <select
                    className="filter-select"
                    value={filters.ratingSort}
                    onChange={onChange('ratingSort')}
                  >
                    <option value="none">정렬 없음</option>
                    <option value="high">높은 평점</option>
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
                    <option value="none">정렬 없음</option>
                    <option value="desc">높은 조회수</option>
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
                    <option value="none">정렬 없음</option>
                    <option value="urgent">마감임박</option>
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
                    <option value="none">정렬 없음</option>
                    <option value="low">낮은 가격</option>
                    <option value="high">High Price</option>
                  </select>
                </div>
              </div>

              {/* 검색창은 유지 */}
              <div className="filter-search-row">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="제목·지역 검색"
                    value={filters.q}
                    onChange={onChange('q')}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  />
                  <span className="search-icon" onClick={onSearch}>🔍</span>
                </div>
              </div>
            </section>
          </div>

          <div className="parallel-right">
            {/* ===== 미니 리뷰 섹션 (데스크탑 병렬용) ===== */}
            <section className="review-wrap-mini">
              <div className="review-title-row">
                <h3>Quick Reviews</h3> 
                <span className="review-count">{filteredReviews.length} items</span>
              </div>

              <div className="review-list-mini">
                {filteredReviews.slice(0, 3).map((r) => (
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
        </div>
      )}

      {/* ===== 모바일용 기존 레이아웃 (리뷰 보기 탭에서만 표시) ===== */}
      {activeTab === 'reviews' && (
        <div className="filter-review-layout">
          <section className="filter-wrap">
            <div className="filter-title">필터</div>

            <div className="filter-grid">
              {/* 평점순 */}
              <div className="filter-item">
                <label>Rating</label>
                <select
                  className="filter-select"
                  value={filters.ratingSort}
                  onChange={onChange('ratingSort')}
                >
                  <option value="none">정렬 없음</option>
                  <option value="high">높은 평점</option>
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
                  <option value="none">정렬 없음</option>
                  <option value="desc">높은 조회수</option>
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
                  <option value="none">정렬 없음</option>
                  <option value="urgent">마감임박</option>
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
                  <option value="none">정렬 없음</option>
                  <option value="low">낮은 가격</option>
                  <option value="high">High Price</option>
                </select>
              </div>
            </div>

            {/* 검색창은 유지 */}
            <div className="filter-search-row">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="제목·지역 검색"
                  value={filters.q}
                  onChange={onChange('q')}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                />
                <span className="search-icon" onClick={onSearch}>🔍</span>
              </div>
            </div>
          </section>
          
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
      )}
    </div>
  );
};

export default Genre;
