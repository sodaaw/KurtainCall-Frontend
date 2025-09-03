import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Recommended.css'; 
import Topnav from '../components/Topnav';
import axios from 'axios';

const Recommended = () => {
  const location = useLocation();
  const selectedPoster = location.state?.selectedPoster;

  // 달력 상태 관리 - Hooks는 항상 최상위 레벨에서 호출되어야 함
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  // 옵션 섹션으로 스크롤하기 위한 ref
  const dateOptionsRef = useRef(null);
  const [playData, setPlayData] = useState(null);

  // 날짜가 선택되면 옵션 섹션으로 자동 스크롤
  useEffect(() => {
    if (selectedDate && dateOptionsRef.current) {
      dateOptionsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    // 여러 가능한 API 엔드포인트 시도
    const fetchPlays = async () => {
      try {
        const possibleEndpoints = [
          '/api/play',
          '/api/plays', 
          '/api/theater',
          '/api/shows',
          '/api/movies'
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
          setPlays(playsData);
          setLoading(false);
        } else {
          // API 실패 시 더미 데이터 사용
          const dummyPlays = [
            {
              title: '웃음의 학교',
              category: 'comedy',
              area: '서울 종로구 대학로10길 11',
              price: '20,000원',
              stars: 4.8
            },
            {
              title: '개그맨의 밤',
              category: 'comedy',
              area: '서울 마포구 홍대로 123',
              price: '25,000원',
              stars: 4.5
            },
            {
              title: '즉흥 연기',
              category: 'comedy',
              area: '서울 강남구 강남대로 456',
              price: '30,000원',
              stars: 4.7
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

  useEffect(() => {
    const fetchPlay = async () => {
      try {
        // 여러 가능한 API 엔드포인트 시도
        const possibleEndpoints = [
          '/api/play',
          '/api/plays', 
          '/api/theater',
          '/api/shows',
          '/api/movies'
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
          // 선택된 포스터의 title과 일치하는 항목 찾기
          const matched = playsData.find(item => item.title === selectedPoster?.title);
          setPlayData(matched || null);
          setLoading(false);
        } else {
          // API 실패 시 더미 데이터에서 찾기
          const dummyPlays = [
            {
              title: '웃음의 학교',
              category: 'comedy',
              area: '서울 종로구 대학로10길 11',
              price: '20,000원',
              stars: 4.8
            },
            {
              title: '개그맨의 밤',
              category: 'comedy',
              area: '서울 마포구 홍대로 123',
              price: '25,000원',
              stars: 4.5
            },
            {
              title: '즉흥 연기',
              category: 'comedy',
              area: '서울 강남구 강남대로 456',
              price: '30,000원',
              stars: 4.7
            }
          ];
          
          const matched = dummyPlays.find(item => item.title === selectedPoster?.title);
          setPlayData(matched || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('연극 데이터 로드 실패:', error);
        setLoading(false);
      }
    };
  
    fetchPlay();
  }, [selectedPoster]);
  

  // 현재 월의 날짜들 생성
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // 이전 달의 마지막 날짜들
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false, isAvailable: false });
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      // 공연 기간 내의 날짜만 사용 가능하도록 설정
      const isAvailable = isDateInPerformancePeriod(currentDate);
      days.push({ date: currentDate, isCurrentMonth: true, isAvailable });
    }
    
    // 다음 달의 첫 날짜들 (6주 달력을 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false, isAvailable: false });
    }
    
    return days;
  };

  // 공연 기간 내의 날짜인지 확인
  const isDateInPerformancePeriod = (date) => {
    // 모든 날짜를 사용 가능하도록 설정
    return true;
  };

  // 달력 네비게이션
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 날짜 선택
  const handleDateSelect = (day) => {
    if (day.isAvailable) {
      setSelectedDate(day.date);
    }
  };

  // 선택된 날짜의 옵션들
  const getDateOptions = (date) => {
    if (!date) return [];
    
    // 예시 옵션들 (실제로는 API에서 가져올 데이터)
    return [
      { time: '14:00', price: '50,000 KRW', seats: 'Seats A-1, A-2, A-3', status: 'available' },
      { time: '16:00', price: '50,000 KRW', seats: 'Seats B-1, B-2', status: 'available' },
      { time: '19:00', price: '60,000 KRW', seats: 'Seats C-1, C-2, C-3, C-4', status: 'available' },
      { time: '21:00', price: '60,000 KRW', seats: 'Seats D-1, D-2', status: 'limited' },
    ];
  };

  // 선택된 날짜로 예매하기
  const handleBookForDate = (date) => {
    // 선택된 날짜의 예매 링크로 이동
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const bookingUrl = `https://ticket.interpark.com?date=${formattedDate}&event=${encodeURIComponent(selectedPoster.title)}`;
    window.open(bookingUrl, '_blank');
  };

  const days = getDaysInMonth(currentMonth);
  const dateOptions = getDateOptions(selectedDate);

  if (loading) return <div>Loading...</div>;
  if(!playData) return <div>No more play data...</div>;
  return (
    <div className="genre-container">
      <Topnav />
      
      <div className="poster-detail-container">
        {/* 포스터 이미지와 기본 정보 */}
        <div className="poster-main-section">
          <div className="poster-image-container">
            <img referrerPolicy="no-referrer"
              src={selectedPoster.image} 
              alt={selectedPoster.title} 
              className="poster-detail-image"
            />
          </div>
          
          <div className="poster-info-section">
            <h1 className="poster-title">{selectedPoster.title}</h1>
            <div className="poster-category">{selectedPoster.category}</div>
            
            <div className="info-and-calendar-container">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">📍 Venue</span>
                  <span className="info-value">{playData.area || '정보없음'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">🎭 Category</span>
                  <span className="info-value">{playData.category || '정보없음'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">💰 Price</span>
                  <span className="info-value">{playData.price || '정보 없음'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">⭐ Rating</span>
                  <span className="info-value">{playData.stars ? `${playData.stars}/5.0` : '정보 없음'}</span>
                </div>
              </div>
              
              <div className="calendar-preview">
                <h3 className="calendar-preview-title">📅 Select Date</h3>
                <div className="calendar-preview-container">
                  <div className="calendar-preview-header">
                    <button onClick={goToPreviousMonth} className="month-nav-btn-small">‹</button>
                    <span className="current-month-small">
                      {currentMonth.getFullYear()} {currentMonth.getMonth() + 1}
                    </span>
                    <button onClick={goToNextMonth} className="month-nav-btn-small">›</button>
                  </div>
                  
                  <div className="calendar-preview-grid">
                    <div className="calendar-preview-weekdays">
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>
                    
                    <div className="calendar-preview-days">
                      {days.slice(0, 35).map((day, index) => (
                        <div key={index} className="calendar-preview-day-wrapper">
                          <button
                            className={`calendar-preview-day ${
                              !day.isCurrentMonth ? 'other-month' : ''
                            } ${
                              day.isAvailable ? 'available' : 'unavailable'
                            } ${
                              selectedDate && 
                              day.date.toDateString() === selectedDate.toDateString() 
                                ? 'selected' : ''
                            }`}
                            onClick={() => handleDateSelect(day)}
                            disabled={!day.isAvailable}
                          >
                            {day.date.getDate()}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 날짜 정보 표시 */}
        {selectedDate && (
          <div className="selected-date-info">
            <h4>Selected Date: {selectedDate.getFullYear()}/{selectedDate.getMonth() + 1}/{selectedDate.getDate()}</h4>
            <p>Select a time slot below to proceed with booking.</p>
          </div>
        )}

        {/* 선택된 날짜의 옵션들 */}
        {selectedDate && (
          <div className="date-options-section" ref={dateOptionsRef}>
            <h2 className="section-title">
              📍 Options for {selectedDate.getFullYear()}/{selectedDate.getMonth() + 1}/{selectedDate.getDate()}
            </h2>
            
            <div className="options-grid">
              {dateOptions.map((option, index) => (
                <div key={index} className={`option-card ${option.status}`}>
                  <div className="option-header">
                    <span className="option-time">{option.time}</span>
                    <span className={`option-status ${option.status}`}>
                      {option.status === 'available' ? 'Available' : 'Limited Seats'}
                    </span>
                  </div>
                  
                  <div className="option-details">
                    <div className="option-price">{option.price}</div>
                    <div className="option-seats">{option.seats}</div>
                  </div>
                  
                  <button 
                    className="select-option-btn"
                    onClick={() => handleBookForDate(selectedDate)}
                  >
                    {option.status === 'available' ? 'Book Now' : 'Waitlist'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommended;
