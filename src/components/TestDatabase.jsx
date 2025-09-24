import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestDatabase.css';

const TestDatabase = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [filterCharacter, setFilterCharacter] = useState('all');

  // 6가지 문화생활 유형 정보 (TestResults와 일치)
  const characterInfo = {
    Explorer: {
      emoji: '🗺️',
      name: 'Explorer (탐험가)',
      description: '새로운 전시·공연·카페를 적극적으로 탐험하고, 낯선 공간에서 설렘을 느끼는 타입입니다. 다양한 경험을 통해 폭넓은 시각을 형성하지만, 깊이 있는 감상보다는 경험 체크리스트에 집중할 수 있어 가끔은 한 곳에 오래 머물러 보는 것이 좋습니다.',
      traits: ['호기심', '발견', '모험', '탐험'],
      recommendedGenres: ['다양한 장르', '새로운 공간', '트렌드'],
      recommendedPlays: ['다양한 장소', '기록 남기기', '경험 정리']
    },
    Immerser: {
      emoji: '🎭',
      name: 'Immerser (몰입가)',
      description: '하나의 작품이나 공연에 오랜 시간 집중하며 깊게 몰입하는 타입입니다. 작품과 강렬한 정서적 교감을 경험하지만, 혼자만의 세계에 치우쳐 주변 사람들과의 교류 기회를 놓칠 수 있어 가끔은 함께 즐겨보는 것이 좋습니다.',
      traits: ['집중', '내면', '감정 연결', '몰입'],
      recommendedGenres: ['조용한 공간', '깊이 있는 작품', '개인 감상'],
      recommendedPlays: ['조용한 자리', '혼자 감상', '온라인 커뮤니티 참여']
    },
    Connector: {
      emoji: '🤝',
      name: 'Connector (교류가)',
      description: '친구·가족·동료와 함께 문화생활을 즐기며, 감상을 대화와 교류로 확장하는 타입입니다. 문화 경험을 통해 인간관계를 강화하지만, 함께할 사람이 없을 경우 문화생활을 미루게 될 수 있어 혼자만의 경험에도 익숙해지는 것이 좋습니다.',
      traits: ['관계', '공유', '소통', '교류'],
      recommendedGenres: ['함께 즐기는 문화', '소셜 이벤트', '공동체 활동'],
      recommendedPlays: ['함께 앉기 좋은 자리', '체험형 전시', '소셜 분위기 카페']
    },
    Seeker: {
      emoji: '🧘',
      name: 'Seeker (치유가)',
      description: '전시·공연·카페 같은 공간을 통해 마음의 안정을 찾고 일상 속 피로를 해소하는 타입입니다. 자신에게 맞는 문화적 환경을 선택해 스트레스를 줄이지만, 늘 편안한 경험만 고집하다 보면 새로운 장르나 강렬한 경험을 놓칠 수 있어 가끔은 도전해보는 것이 좋습니다.',
      traits: ['힐링', '회복', '안정', '치유'],
      recommendedGenres: ['편안한 공간', '힐링 콘텐츠', '안정적 환경'],
      recommendedPlays: ['편안한 자리', '익숙한 힐링 공간', '신선한 공연·전시 곁들이기']
    },
    Performer: {
      emoji: '🎨',
      name: 'Performer (표현가)',
      description: '관람자이지만 동시에 자신이 무대에 서는 상상을 즐기고, 예술적 자극을 받으면 창작 욕구가 솟구치는 타입입니다. 예술의 디테일에 민감해 작품 속 의미를 잘 캐치하지만, 비판적 시각에 머무를 수 있어 타인의 작품을 있는 그대로 즐기는 여유가 필요합니다.',
      traits: ['표현', '창조', '주체성', '예술성'],
      recommendedGenres: ['예술 작품', '창작 활동', '표현 예술'],
      recommendedPlays: ['무대 가까운 자리', '감상 후 글쓰기', '드로잉, 퍼포먼스']
    },
    Wanderer: {
      emoji: '🌊',
      name: 'Wanderer (방랑가)',
      description: '큰 계획 없이 즉흥적으로 문화생활을 즐기며, 오늘의 기분과 상황에 따라 움직이는 타입입니다. 틀에 얽매이지 않고 다양한 경험을 접할 수 있지만, 계획이 없으니 원하는 공연·전시를 놓칠 수 있어 가볍게 문화 캘린더를 확인해보는 것이 좋습니다.',
      traits: ['자유', '즉흥', '유연성', '방랑'],
      recommendedGenres: ['즉흥적 경험', '자유로운 공간', '우연한 만남'],
      recommendedPlays: ['어디든 자유롭게', '문화 캘린더 확인', '관심 분야 알림 설정']
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

  // 문화생활 유형별 통계 (TestResults의 6개 유형에 맞춤)
  const characterStats = {
    Explorer: testResults.filter(r => r.topCharacter === 'Explorer').length,
    Immerser: testResults.filter(r => r.topCharacter === 'Immerser').length,
    Connector: testResults.filter(r => r.topCharacter === 'Connector').length,
    Seeker: testResults.filter(r => r.topCharacter === 'Seeker').length,
    Performer: testResults.filter(r => r.topCharacter === 'Performer').length,
    Wanderer: testResults.filter(r => r.topCharacter === 'Wanderer').length
  };

  // 총 테스트 수
  const totalTests = testResults.length;

  // 퍼센트 계산
  const characterPercentages = {
    Explorer: totalTests > 0 ? (characterStats.Explorer / totalTests * 100) : 0,
    Immerser: totalTests > 0 ? (characterStats.Immerser / totalTests * 100) : 0,
    Connector: totalTests > 0 ? (characterStats.Connector / totalTests * 100) : 0,
    Seeker: totalTests > 0 ? (characterStats.Seeker / totalTests * 100) : 0,
    Performer: totalTests > 0 ? (characterStats.Performer / totalTests * 100) : 0,
    Wanderer: totalTests > 0 ? (characterStats.Wanderer / totalTests * 100) : 0
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
            <h1 className="testdatabase-title">전체 유형 보기</h1>
            <div className="header-buttons">
              {/* <button className="take-test-btn" onClick={handleTakeTest}>
                테스트 다시 하기
              </button> */}
              {/* <button className="clear-results-btn" onClick={handleClearResults}>
                결과 삭제하기
              </button> */}
            </div>
          </div>
        </div>

        {/* 문화생활 유형 통계 섹션 */}
        <section className="character-statistics">
          <h2>유형별 통계</h2>
          {/* 안내 텍스트 */}
          <div className="instruction-text">
            각 유형을 클릭하면 자세한 설명을 확인할 수 있어요!
          </div>
          <div className="character-stats-grid">
            {Object.entries(characterStats).map(([character, count]) => {
              const info = characterInfo[character];
              if (!info) return null; // characterInfo에 없는 캐릭터는 건너뛰기
              
              return (
                <div 
                  key={character} 
                  className={`character-stat-card ${filterCharacter === character ? 'active' : ''}`}
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className="character-emoji">{info.emoji}</div>
                  <div className="character-name">{info.name}</div>
                  <div className="character-count">{count}명</div>
                </div>
              );
            })}
          </div>

          {/* Bar Graph */}
          <div className="bar-graph-container">
            <h3>유형별 분포</h3>
            <div className="bar-graph">
              {Object.entries(characterPercentages).map(([character, percentage]) => {
                const info = characterInfo[character];
                if (!info) return null;
                
                return (
                  <div key={character} className="bar-item">
                    <div className="bar-label">
                      <span className="bar-emoji">{info.emoji}</span>
                      <span className="bar-name">{info.name}</span>
                      <span className="bar-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 필터 옵션 */}
        {/* <section className="filter-section">
          <h3>필터 옵션</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterCharacter === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCharacter('all')}
            >
              전체 유형 보기
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
        </section> */}

        {/* 테스트 결과 목록 */}
        {/* <section className="test-results-list">
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
              {filteredResults.map((result, index) => {
                const info = characterInfo[result.topCharacter];
                if (!info) return null; // characterInfo에 없는 캐릭터는 건너뛰기
                
                return (
                  <div key={index} className="result-card">
                    <div className="result-header">
                      <div className="character-emoji-large">
                        {info.emoji}
                      </div>
                      <div className="result-info">
                        <div className="result-character">
                          {info.name}
                        </div>
                        <div className="result-date">
                          {result.date} {result.time}
                        </div>
                      </div>
                    </div>
                    <div className="result-scores">
                      <div className="score-item">
                        <span className="score-label">1위:</span>
                        <span className="score-value">{info.name} ({(result.topScore * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">점수:</span>
                        <span className="score-value">{(result.topScore * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section> */}

        {/* 선택된 캐릭터 상세 정보 모달 */}
        {selectedCharacter && (
          <div className="character-modal-overlay" onClick={handleCloseCharacter}>
            <div className="character-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-character-emoji">
                  {characterInfo[selectedCharacter].emoji}
                </div>
                <h2>{characterInfo[selectedCharacter].name}</h2>
                <button className="tst-close-btn" onClick={handleCloseCharacter}>×</button>
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
                  <h3>추천 시스템</h3>
                  <div className="tag-list">
                    {characterInfo[selectedCharacter].recommendedGenres.map((genre, index) => (
                      <span key={index} className="tag">{genre}</span>
                    ))}
                  </div>
                </div>
                
                <div className="character-recommendations">
                  <h3>추천 행동</h3>
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

        {/* 고정된 테스트 다시 하기 버튼 */}
        <div className="fixed-test-button">
          <button className="take-test-btn" onClick={handleTakeTest}>
            테스트 다시 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDatabase;
