import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestDatabase.css';

const TestDatabase = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [filterCharacter, setFilterCharacter] = useState('all');

  // 10가지 캐릭터 정보 (TestResults와 일치)
  const characterInfo = {
    Romeo: {
      emoji: '💕',
      name: '로미오형',
      description: '즉흥적 낭만주의자로, 감정이 먼저 움직이고 빠르게 달리는 로맨스에 심장이 바로 반응합니다. 큰 감정선이 치고 나가는 이야기에서 가장 행복해집니다.',
      traits: ['즉흥적', '낭만적', '감정적', '로맨틱'],
      recommendedGenres: ['로맨틱 드라마', '청춘극', '뮤지컬'],
      recommendedPlays: ['로미오와 줄리엣', '청춘극', '로맨틱 뮤지컬']
    },
    Hamlet: {
      emoji: '🤔',
      name: '햄릿형',
      description: '깊이 사색하는 관객으로, 길어도 좋은 대사와 생각할 거리가 많은 작품을 좋아합니다. 인물의 마음 결을 따라가며 의미를 오래 씹는 편입니다.',
      traits: ['사색적', '깊이 있는', '철학적', '성찰적'],
      recommendedGenres: ['심리극', '고전 비극', '철학극'],
      recommendedPlays: ['햄릿', '오이디푸스', '맥베스']
    },
    Macbeth: {
      emoji: '⚡',
      name: '맥베스형',
      description: '강렬한 속도와 야망 서사를 선호하며, 팽팽한 긴장감과 거침없는 연출에 쾌감을 느낍니다. 템포 빠르고 에너지 높은 이야기에서 몰입이 최대로 올라갑니다.',
      traits: ['강렬한', '속도감', '야망적', '긴장감'],
      recommendedGenres: ['스릴러 드라마', '다크 클래식', '액션극'],
      recommendedPlays: ['맥베스', '리어왕', '스릴러 작품']
    },
    LadyMacbeth: {
      emoji: '👑',
      name: '레이디 맥베스형',
      description: '주도권과 심리의 파고를 선호하며, 욕망과 권력의 심리전, 선택의 무게에 끌립니다. 인물의 결단이 판을 뒤집는 순간에 강하게 몰입합니다.',
      traits: ['주도적', '심리적', '권력적', '결단적'],
      recommendedGenres: ['심리극', '권력 드라마', '도덕극'],
      recommendedPlays: ['맥베스', '권력 드라마', '심리 스릴러']
    },
    Viola: {
      emoji: '🎭',
      name: '비올라형',
      description: '재치와 변장의 코미디 감각을 가진 타입으로, 가볍고 유쾌한 톤, 위트 있는 상황극이 취향입니다. 정체성 뒤바뀜과 오해 게임에서 오는 유머를 특히 즐깁니다.',
      traits: ['재치있는', '유쾌한', '위트있는', '상황극'],
      recommendedGenres: ['로맨틱 코미디', '상황극', '가벼운 코미디'],
      recommendedPlays: ['십이야', '로맨틱 코미디', '상황극']
    },
    Beatrice: {
      emoji: '💬',
      name: '베아트리체형',
      description: '말맛과 티키타카를 애호하는 타입으로, 말맛 좋은 대사, 빠른 티키타카에 설렙니다. 재치 있는 설전과 밀당 로맨스에서 재미를 가장 크게 느낍니다.',
      traits: ['말맛있는', '티키타카', '재치있는', '밀당'],
      recommendedGenres: ['코미디 오브 매너스', '대사 위주 로코', '밀당극'],
      recommendedPlays: ['헛소동', '대사 위주 코미디', '밀당 로맨스']
    },
    Puck: {
      emoji: '✨',
      name: '퍽형',
      description: '판타지와 무대마술을 애호하는 타입으로, 시각적인 장치와 환상적인 분위기에 끌립니다. 몸으로 느끼는 리듬과 무대의 마술이 있는 작품을 좋아합니다.',
      traits: ['판타지적', '마술적', '시각적', '환상적'],
      recommendedGenres: ['판타지극', '넌버벌', '마술극'],
      recommendedPlays: ['한여름밤의 꿈', '판타지 작품', '넌버벌']
    },
    Cordelia: {
      emoji: '💝',
      name: '코델리아형',
      description: '진정성과 가족 드라마를 지향하는 타입으로, 관계의 진심, 책임과 윤리 같은 주제가 마음에 남습니다. 조용하지만 묵직한 감정선을 오래 품는 편입니다.',
      traits: ['진정성', '가족적', '책임감', '묵직한'],
      recommendedGenres: ['가족 비극', '인물 드라마', '윤리극'],
      recommendedPlays: ['리어왕', '가족 드라마', '인물극']
    },
    Cyrano: {
      emoji: '📝',
      name: '시라노형',
      description: '언어와 낭만의 미학을 추구하는 타입으로, 시적인 표현과 우아한 낭만을 즐깁니다. 말의 리듬과 운율, 고전적 매무새에서 큰 만족을 느낍니다.',
      traits: ['시적', '낭만적', '우아한', '고전적'],
      recommendedGenres: ['낭만드라마', '클래식 코미디', '시극'],
      recommendedPlays: ['시라노 드 베르주라크', '낭만 드라마', '시극']
    },
    JeanValjean: {
      emoji: '🕊️',
      name: '장 발장형',
      description: '구원과 도덕의 휴먼 드라마를 선호하는 타입으로, 선한 의지와 구원의 이야기에 약합니다. 사람을 살리는 선택과 눈물 포인트에서 깊게 흔들립니다.',
      traits: ['구원적', '도덕적', '휴먼', '감동적'],
      recommendedGenres: ['휴먼 드라마', '대형 뮤지컬', '구원극'],
      recommendedPlays: ['레 미제라블', '휴먼 드라마', '구원의 이야기']
    }
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 테스트 결과 불러오기
  useEffect(() => {
    const savedResults = localStorage.getItem('theaterMBTIResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        // TestResults에서 저장된 형식에 맞게 데이터 변환
        const formattedResults = parsedResults.map(result => ({
          topCharacter: result.top,
          topCharacterLabel: result.top,
          topScore: result.scores[result.top] || 0,
          secondaryCharacterLabel: 'N/A',
          secondaryScore: 0,
          tertiaryCharacterLabel: 'N/A',
          tertiaryScore: 0,
          date: new Date(result.timestamp).toLocaleDateString('ko-KR'),
          time: new Date(result.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          answers: result.answers,
          scores: result.scores
        }));
        setTestResults(formattedResults);
      } catch (error) {
        console.error('테스트 결과 파싱 오류:', error);
        setTestResults([]);
      }
    }
  }, []);

  // 캐릭터별 필터링된 결과
  const filteredResults = filterCharacter === 'all' 
    ? testResults 
    : testResults.filter(result => result.topCharacter === filterCharacter);

  // 캐릭터별 통계 (TestResults의 10개 캐릭터에 맞춤)
  const characterStats = {
    Romeo: testResults.filter(r => r.topCharacter === 'Romeo').length,
    Hamlet: testResults.filter(r => r.topCharacter === 'Hamlet').length,
    Macbeth: testResults.filter(r => r.topCharacter === 'Macbeth').length,
    LadyMacbeth: testResults.filter(r => r.topCharacter === 'LadyMacbeth').length,
    Viola: testResults.filter(r => r.topCharacter === 'Viola').length,
    Beatrice: testResults.filter(r => r.topCharacter === 'Beatrice').length,
    Puck: testResults.filter(r => r.topCharacter === 'Puck').length,
    Cordelia: testResults.filter(r => r.topCharacter === 'Cordelia').length,
    Cyrano: testResults.filter(r => r.topCharacter === 'Cyrano').length,
    JeanValjean: testResults.filter(r => r.topCharacter === 'JeanValjean').length
  };

  const handleCharacterClick = (characterName) => {
    setSelectedCharacter(characterName);
    setFilterCharacter(characterName);
  };

  const handleCloseCharacter = () => {
    setSelectedCharacter(null);
  };

  const handleTakeTest = () => {
    navigate('/test/my-test');
  };

  const handleClearResults = () => {
    if (window.confirm('모든 테스트 결과를 삭제하시겠습니까?')) {
      localStorage.removeItem('theaterMBTIResults');
      setTestResults([]);
    }
  };

  return (
    <div className="testdatabase-container">
      <Topnav />
      
      <div className="testdatabase-content">
        <div className="testdatabase-header">
          <div className="header-content">
            <h1 className="testdatabase-title">테스트 데이터베이스</h1>
            <div className="header-buttons">
              <button className="take-test-btn" onClick={handleTakeTest}>
                테스트 하기
              </button>
              <button className="clear-results-btn" onClick={handleClearResults}>
                결과 삭제
              </button>
            </div>
          </div>
        </div>

        {/* 캐릭터 통계 섹션 */}
        <section className="character-statistics">
          <h2>캐릭터별 통계</h2>
          <div className="character-stats-grid">
            {Object.entries(characterStats).map(([character, count]) => (
              <div 
                key={character} 
                className={`character-stat-card ${filterCharacter === character ? 'active' : ''}`}
                onClick={() => handleCharacterClick(character)}
              >
                <div className="character-emoji">{characterInfo[character].emoji}</div>
                <div className="character-name">{characterInfo[character].name}</div>
                <div className="character-count">{count}명</div>
              </div>
            ))}
          </div>
        </section>

        {/* 필터 옵션 */}
        <section className="filter-section">
          <h3>필터 옵션</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterCharacter === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCharacter('all')}
            >
              전체 보기
            </button>
            {Object.keys(characterInfo).map(character => (
              <button 
                key={character}
                className={`filter-btn ${filterCharacter === character ? 'active' : ''}`}
                onClick={() => setFilterCharacter(character)}
              >
                {characterInfo[character].emoji} {characterInfo[character].name}
              </button>
            ))}
          </div>
        </section>

        {/* 테스트 결과 목록 */}
        <section className="test-results-list">
          <h2>테스트 결과 ({filteredResults.length}개)</h2>
          {filteredResults.length === 0 ? (
            <div className="no-results">
              <p>테스트 결과가 없습니다.</p>
              <button className="take-test-btn" onClick={handleTakeTest}>
                테스트 시작하기
              </button>
            </div>
          ) : (
            <div className="results-grid">
              {filteredResults.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <div className="character-emoji-large">
                      {characterInfo[result.topCharacter].emoji}
                    </div>
                    <div className="result-info">
                      <div className="result-character">
                        {characterInfo[result.topCharacter].name}
                      </div>
                      <div className="result-date">
                        {result.date} {result.time}
                      </div>
                    </div>
                  </div>
                  <div className="result-scores">
                    <div className="score-item">
                      <span className="score-label">1위:</span>
                      <span className="score-value">{characterInfo[result.topCharacter]?.name || result.topCharacter} ({(result.topScore * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">점수:</span>
                      <span className="score-value">{(result.topScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 선택된 캐릭터 상세 정보 모달 */}
        {selectedCharacter && (
          <div className="character-modal-overlay" onClick={handleCloseCharacter}>
            <div className="character-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-character-emoji">
                  {characterInfo[selectedCharacter].emoji}
                </div>
                <h2>{characterInfo[selectedCharacter].emoji} {characterInfo[selectedCharacter].name}</h2>
                <button className="close-btn" onClick={handleCloseCharacter}>×</button>
              </div>
              
              <div className="modal-content">
                <div className="character-description">
                  <p>{characterInfo[selectedCharacter].description}</p>
                </div>
                
                <div className="character-traits">
                  <h3>주요 특성</h3>
                  <div className="traits-list">
                    {characterInfo[selectedCharacter].traits.map((trait, index) => (
                      <span key={index} className="trait-tag">{trait}</span>
                    ))}
                  </div>
                </div>
                
                <div className="character-recommendations">
                  <h3>추천 장르</h3>
                  <div className="tag-list">
                    {characterInfo[selectedCharacter].recommendedGenres.map((genre, index) => (
                      <span key={index} className="tag">{genre}</span>
                    ))}
                  </div>
                </div>
                
                <div className="character-recommendations">
                  <h3>추천 작품</h3>
                  <div className="tag-list">
                    {characterInfo[selectedCharacter].recommendedPlays.map((play, index) => (
                      <span key={index} className="tag">{play}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDatabase;
