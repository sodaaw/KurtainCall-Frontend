import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestDatabase.css';

const TestDatabase = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [filterCharacter, setFilterCharacter] = useState('all');

  // 4가지 안전 유형 정보 (TestResults와 일치)
  const characterInfo = {
    Sentinel: {
      emoji: '🔍',
      name: 'Sentinel (경계자)',
      description: '위험 신호에 아주 민감하고, 사전 대비를 중시하는 타입입니다. 빠른 감지와 예방적 행동이 강점이지만, 지나친 불안이 피로로 이어질 수 있어 균형 잡힌 태도가 필요합니다.',
      traits: ['위험 감지', '예방 행동', '안전 체크', '민감함'],
      recommendedGenres: ['스마트 알림', '예방 시스템', '안전 체크'],
      recommendedPlays: ['출입구 근처', '안전 장치 활용', '스마트 앱 적극 사용']
    },
    Guardian: {
      emoji: '🛡️',
      name: 'Guardian (수호자)',
      description: '자신보다 주변 사람들의 안전을 더 의식하는 공동체형입니다. 지역사회 안전 네트워크에 기여할 수 있지만, 본인 스스로의 안전 대비를 놓칠 수 있어 자기 보호 습관 강화가 필요합니다.',
      traits: ['공동체 안전', '타인 배려', '사회적 책임', '수호자'],
      recommendedGenres: ['가족 안전', '공동체 시스템', '사회적 책임'],
      recommendedPlays: ['중앙 위치', '가족/친구와 함께', '공동체 참여']
    },
    Navigator: {
      emoji: '🧭',
      name: 'Navigator (대처가)',
      description: '위험 상황에서는 침착하게 행동하지만, 평소 대비는 소홀한 편입니다. 위기 상황에서의 침착함이 강점이지만, 사전 인식과 예방 행동이 부족해 훈련과 기술 활용을 생활화할 필요가 있습니다.',
      traits: ['침착함', '기술 활용', '위기 대응', '대처력'],
      recommendedGenres: ['스마트 기기', '위기 대응', '기술 활용'],
      recommendedPlays: ['유동적 위치', '스마트 기기 필수', '위기 대응 훈련']
    },
    Unaware: {
      emoji: '😅',
      name: 'Unaware (안전 불감형)',
      description: '"설마 나한테?"라는 태도로 위험을 과소평가하는 타입입니다. 군중 속에서도 불안이 적고 스트레스가 덜하지만, 안전 불감증은 대형사고로 직결될 수 있어 기초 안전 교육과 기술 기반 알림이 꼭 필요합니다.',
      traits: ['안전 불감', '과소평가', '무관심', '낙관적'],
      recommendedGenres: ['기초 안전 교육', '기술 기반 알림', '안전 인식 개선'],
      recommendedPlays: ['어디든 상관없음', '기초 안전 교육', '스마트 알림 활용']
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

  // 안전 유형별 통계 (TestResults의 4개 유형에 맞춤)
  const characterStats = {
    Sentinel: testResults.filter(r => r.topCharacter === 'Sentinel').length,
    Guardian: testResults.filter(r => r.topCharacter === 'Guardian').length,
    Navigator: testResults.filter(r => r.topCharacter === 'Navigator').length,
    Unaware: testResults.filter(r => r.topCharacter === 'Unaware').length
  };

  // 총 테스트 수
  const totalTests = testResults.length;

  // 퍼센트 계산
  const characterPercentages = {
    Sentinel: totalTests > 0 ? (characterStats.Sentinel / totalTests * 100) : 0,
    Guardian: totalTests > 0 ? (characterStats.Guardian / totalTests * 100) : 0,
    Navigator: totalTests > 0 ? (characterStats.Navigator / totalTests * 100) : 0,
    Unaware: totalTests > 0 ? (characterStats.Unaware / totalTests * 100) : 0
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
              <button className="take-test-btn" onClick={handleTakeTest}>
                테스트 다시 하기
              </button>
              {/* <button className="clear-results-btn" onClick={handleClearResults}>
                결과 삭제하기
              </button> */}
            </div>
          </div>
        </div>

        {/* 안전 유형 통계 섹션 */}
        <section className="character-statistics">
          <h2>유형별 통계</h2>
          {/* 안내 텍스트 */}
          <div className="instruction-text">
            클릭하면 각 유형의 상세 설명 조회 가능
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
      </div>
    </div>
  );
};

export default TestDatabase;
