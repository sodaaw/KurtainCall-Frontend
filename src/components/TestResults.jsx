import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestResults.css';

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testResults = location.state?.testResults;

  const handleRetakeTest = () => {
    navigate('/test/my-test');
  };

  // 테스트 결과를 로컬 스토리지에 저장
  useEffect(() => {
    if (testResults) {
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('ko-KR');
      const timeStr = currentDate.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // 6가지 캐릭터 분석 로직
      const sum = (idxList) => idxList.reduce((acc, i) => acc + (Number(testResults[i]) || 0), 0);

      // 각 차원별 점수 계산
      const dramaticScore = sum([0, 12, 13]); // 드라마/비극, 감동, 철학적 작품
      const comedyScore = sum([1, 18, 19]); // 코미디, 짧고 가벼운, 소통
      const experimentalScore = sum([2, 6, 7]); // 실험적 연극, 상징적 작품, 각색 작품
      const interactiveScore = sum([3, 4, 8]); // 인터랙티브, 몸짓/무언극, 소극장 친밀
      const socialScore = sum([5, 9, 16]); // 사회적 메시지, 대규모 공연, 라이브 연기
      const traditionalScore = sum([10, 11, 15]); // 새로운 배우, 유명 배우, 한국적 정서

      // 가장 높은 점수를 가진 차원을 찾아 캐릭터 결정
      const scores = [
        { name: 'dramatic', score: dramaticScore, label: '드라마틱' },
        { name: 'comedy', score: comedyScore, label: '코미디' },
        { name: 'experimental', score: experimentalScore, label: '실험적' },
        { name: 'interactive', score: interactiveScore, label: '인터랙티브' },
        { name: 'social', score: socialScore, label: '소셜' },
        { name: 'traditional', score: traditionalScore, label: '전통적' }
      ];

      // 점수 순으로 정렬하여 상위 3개 캐릭터 선택
      scores.sort((a, b) => b.score - a.score);
      const topCharacter = scores[0];
      const secondaryCharacter = scores[1];
      const tertiaryCharacter = scores[2];

      // 저장할 테스트 결과 객체
      const testResult = {
        date: dateStr,
        time: timeStr,
        topCharacter: topCharacter.name,
        topCharacterLabel: topCharacter.label,
        topScore: topCharacter.score,
        secondaryCharacter: secondaryCharacter.name,
        secondaryCharacterLabel: secondaryCharacter.label,
        secondaryScore: secondaryCharacter.score,
        tertiaryCharacter: tertiaryCharacter.name,
        tertiaryCharacterLabel: tertiaryCharacter.label,
        tertiaryScore: tertiaryCharacter.score,
        allScores: scores,
        answers: testResults
      };

      // 기존 결과 불러오기
      const existingResults = JSON.parse(localStorage.getItem('theaterCharacterResults') || '[]');
      
      // 새 결과 추가 (최신 순으로 정렬)
      const updatedResults = [testResult, ...existingResults];
      
      // 로컬 스토리지에 저장
      localStorage.setItem('theaterCharacterResults', JSON.stringify(updatedResults));
    }
  }, [testResults]);

  if (!testResults) {
    return (
      <div className="testresults-container">
        <Topnav />
        <div className="testresults-content">
          <div className="testresults-header">
            <h1 className="testresults-title">Test Results</h1>
            <p className="testresults-subtitle">No test results found. Please take the test first.</p>
            <button className="retake-btn" onClick={handleRetakeTest}>
              Take Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sum = (idxList) => idxList.reduce((acc, i) => acc + (Number(testResults[i]) || 0), 0);

  // 각 차원별 점수 계산
  const dramaticScore = sum([0, 12, 13]); // 드라마/비극, 감동, 철학적 작품
  const comedyScore = sum([1, 18, 19]); // 코미디, 짧고 가벼운, 소통
  const experimentalScore = sum([2, 6, 7]); // 실험적 연극, 상징적 작품, 각색 작품
  const interactiveScore = sum([3, 4, 8]); // 인터랙티브, 몸짓/무언극, 소극장 친밀
  const socialScore = sum([5, 9, 16]); // 사회적 메시지, 대규모 공연, 라이브 연기
  const traditionalScore = sum([10, 11, 15]); // 새로운 배우, 유명 배우, 한국적 정서

  // 가장 높은 점수를 가진 차원을 찾아 캐릭터 결정
  const scores = [
    { name: 'dramatic', score: dramaticScore, label: '드라마틱' },
    { name: 'comedy', score: comedyScore, label: '코미디' },
    { name: 'experimental', score: experimentalScore, label: '실험적' },
    { name: 'interactive', score: interactiveScore, label: '인터랙티브' },
    { name: 'social', score: socialScore, label: '소셜' },
    { name: 'traditional', score: traditionalScore, label: '전통적' }
  ];

  // 점수 순으로 정렬하여 상위 3개 캐릭터 선택
  scores.sort((a, b) => b.score - a.score);
  const topCharacter = scores[0];
  const secondaryCharacter = scores[1];
  const tertiaryCharacter = scores[2];

  // 6가지 캐릭터 정의
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

  return (
    <div className="testresults-container">
      <Topnav />


      <div className="testresults-content">
        <div className="testresults-header">
          <h1 className="testresults-title">Your Theater Character</h1>
                     <p className="testresults-subtitle">여러분의 연극 성향은?</p>
        </div>

        {/* 메인 캐릭터 섹션 */}
        <section className="main-character">
          <div className="character-emoji">{characterInfo[topCharacter.name].emoji}</div>
          <h2 className="character-name">{characterInfo[topCharacter.name].name}</h2>
          <p className="character-description">{characterInfo[topCharacter.name].description}</p>
          <div className="character-score">점수: {topCharacter.score}</div>
        </section>

        {/* 캐릭터 특성 */}
        <section className="character-traits">
          <h3>주요 특성</h3>
          <div className="traits-list">
            {characterInfo[topCharacter.name].traits.map((trait, index) => (
              <span key={index} className="trait-tag">{trait}</span>
            ))}
          </div>
        </section>

        {/* 추천 장르 */}
        <section className="recommendations">
          <h2>추천 장르</h2>
          <div className="tag-list">
            {characterInfo[topCharacter.name].recommendedGenres.map((genre, index) => (
              <span key={index} className="tag">{genre}</span>
            ))}
          </div>
        </section>

        {/* 추천 작품 */}
        <section className="recommendations">
          <h2>추천 작품</h2>
          <div className="cards">
            {characterInfo[topCharacter.name].recommendedPlays.map((play, index) => (
              <div key={index} className="card">{play}</div>
            ))}
          </div>
        </section>

        {/* 전체 6가지 캐릭터 점수 */}
        <section className="all-characters">
          <h2>전체 캐릭터 점수</h2>
          <div className="character-scores">
            {scores.map((char, index) => (
              <div key={index} className={`character-score-item ${char.name === topCharacter.name ? 'top-character' : ''}`}>
                <span className="character-emoji-small">{characterInfo[char.name].emoji}</span>
                <span className="character-label">{char.label}</span>
                <span className="score-value">{char.score}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="action-buttons">
          <button className="retake-btn" onClick={handleRetakeTest}>Retake Test</button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
