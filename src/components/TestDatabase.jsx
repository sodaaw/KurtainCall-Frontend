import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestDatabase.css';

const TestDatabase = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [filterCharacter, setFilterCharacter] = useState('all');

  // 6가지 캐릭터 정보 (이모티콘 사용)
  const characterInfo = {
    dramatic: {
      emoji: '🎭',
      name: '드라마틱',
      description: '감정적 깊이와 비극적 요소를 선호하는 연극 애호가입니다. 울림을 주는 드라마와 철학적 작품에서 진정한 연극의 의미를 찾습니다.',
      traits: ['감정적 몰입', '비극적 요소 선호', '철학적 사고', '깊이 있는 감상'],
      recommendedGenres: ['비극', '드라마', '철학극', '사회극'],
      recommendedPlays: ['햄릿', '오이디푸스', '맥베스', '리어왕']
    },
    comedy: {
      emoji: '😄',
      name: '코미디',
      description: '웃음과 즐거움을 선호하는 밝은 성향의 연극 애호가입니다. 가볍고 재미있는 작품에서 일상의 스트레스를 해소합니다.',
      traits: ['유머러스', '가벼운 분위기', '즉흥적', '소통 선호'],
      recommendedGenres: ['코미디', '패러디', '즉흥극', '가족극'],
      recommendedPlays: ['한여름 밤의 꿈', '웃음의 학교', '즉흥 코미디', '가족 코미디']
    },
    experimental: {
      emoji: '🔬',
      name: '실험적',
      description: '새로운 시도와 혁신적인 형식을 추구하는 도전적인 연극 애호가입니다. 기존의 틀을 깨는 실험적 작품에 매료됩니다.',
      traits: ['혁신적 사고', '새로운 형식 추구', '상징적 해석', '예술적 도전'],
      recommendedGenres: ['실험극', '상징극', '아방가르드', '멀티미디어'],
      recommendedPlays: ['상징극', '실험적 작품', '아방가르드', '혁신적 연극']
    },
    interactive: {
      emoji: '🤝',
      name: '인터랙티브',
      description: '관객 참여와 직접적인 소통을 즐기는 적극적인 연극 애호가입니다. 무대와 객석의 경계를 허물고 함께 만드는 연극을 선호합니다.',
      traits: ['적극적 참여', '소통 선호', '친밀감', '몸짓 표현'],
      recommendedGenres: ['인터랙티브', '참여형', '무언극', '소극장'],
      recommendedPlays: ['인터랙티브 쇼', '참여형 워크숍', '무언극', '소극장 작품']
    },
    social: {
      emoji: '🌍',
      name: '소셜',
      description: '사회적 메시지와 현실 문제를 다루는 작품을 선호하는 사회의식이 높은 연극 애호가입니다. 연극을 통해 사회를 바라보고 변화를 추구합니다.',
      traits: ['사회적 의식', '현실 문제 관심', '메시지 전달', '대규모 공연'],
      recommendedGenres: ['사회극', '리얼리즘', '다큐멘터리', '참여극'],
      recommendedPlays: ['사회 문제극', '현실 드라마', '다큐멘터리', '참여형 사회극']
    },
    traditional: {
      emoji: '🏛️',
      name: '전통적',
      description: '고전적 가치와 전통적 형식을 중시하는 보수적인 연극 애호가입니다. 검증된 작품과 유명 배우의 연기에서 안정감을 찾습니다.',
      traits: ['전통 중시', '고전 선호', '안정감', '검증된 작품'],
      recommendedGenres: ['고전극', '전통극', '클래식', '보수적'],
      recommendedPlays: ['고전 작품', '전통 연극', '클래식', '보수적 작품']
    }
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 테스트 결과 불러오기
  useEffect(() => {
    const savedResults = localStorage.getItem('theaterCharacterResults');
    if (savedResults) {
      setTestResults(JSON.parse(savedResults));
    }
  }, []);

  // 캐릭터별 필터링된 결과
  const filteredResults = filterCharacter === 'all' 
    ? testResults 
    : testResults.filter(result => result.topCharacter === filterCharacter);

  // 캐릭터별 통계
  const characterStats = {
    dramatic: testResults.filter(r => r.topCharacter === 'dramatic').length,
    comedy: testResults.filter(r => r.topCharacter === 'comedy').length,
    experimental: testResults.filter(r => r.topCharacter === 'experimental').length,
    interactive: testResults.filter(r => r.topCharacter === 'interactive').length,
    social: testResults.filter(r => r.topCharacter === 'social').length,
    traditional: testResults.filter(r => r.topCharacter === 'traditional').length
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
      localStorage.removeItem('theaterCharacterResults');
      setTestResults([]);
    }
  };

  return (
    <div className="testdatabase-container">
      <Topnav />
      
      <div className="testdatabase-content">
        <div className="testdatabase-header">
          <div className="header-content">
            <h1 className="testdatabase-title">Test Database</h1>
            <div className="header-buttons">
              <button className="take-test-btn" onClick={handleTakeTest}>
                Take Test
              </button>
              <button className="clear-results-btn" onClick={handleClearResults}>
                Clear Results
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
                      <span className="score-value">{result.topCharacterLabel} ({result.topScore})</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">2위:</span>
                      <span className="score-value">{result.secondaryCharacterLabel} ({result.secondaryScore})</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">3위:</span>
                      <span className="score-value">{result.tertiaryCharacterLabel} ({result.tertiaryScore})</span>
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
