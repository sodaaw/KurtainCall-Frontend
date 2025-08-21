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

      // Theater MBTI 분석 로직
      const sum = (idxList) => idxList.reduce((acc, i) => acc + (Number(testResults[i]) || 0), 0);

      // 1. 참여(P) vs 관찰(O) 축 - 더 극적인 대비
      const pScore = sum([3, 8, 10, 19]); // 인터랙티브, 소극장 친밀, 새로운 배우, 소통
      const oScore = sum([0, 1, 11, 15]); // 드라마/비극, 코미디, 유명 배우, 한국적 정서
      const dim1 = pScore > oScore ? 'P' : (pScore < oScore ? 'O' : (Math.random() > 0.5 ? 'P' : 'O'));

      // 2. 현실(R) vs 상징(S) 축 - 가중치 적용
      const rScore = sum([5, 7, 12, 16]) * 1.2; // 사회적 메시지, 각색 작품, 감동, 라이브 연기
      const sScore = sum([2, 6, 13, 17]) * 1.1; // 실험적 연극, 상징적 작품, 철학적 작품, 대사 중심
      const dim2 = rScore > sScore ? 'R' : (rScore < sScore ? 'S' : (Math.random() > 0.5 ? 'R' : 'S'));

      // 3. 감성(E) vs 이성(I) 축 - 역방향 가중치
      const eScore = sum([0, 4, 12, 15]) * 1.15; // 드라마/비극, 몸짓/무언극, 감동, 한국적 정서
      const iScore = sum([2, 6, 13, 17]) * 1.25; // 실험적 연극, 상징적 작품, 철학적 작품, 대사 중심
      const dim3 = eScore > iScore ? 'E' : (eScore < iScore ? 'I' : (Math.random() > 0.5 ? 'E' : 'I'));

      // 4. 즉흥(F) vs 구조(J) 축 - 극단적 대비
      const fScore = sum([3, 4, 18, 19]) * 1.3; // 인터랙티브, 몸짓/무언극, 짧고 가벼운, 소통
      const jScore = sum([7, 8, 9, 20]) * 1.1; // 각색 작품, 소극장, 대규모 공연, 서사 깊은
      const dim4 = fScore > jScore ? 'F' : (fScore < jScore ? 'J' : (Math.random() > 0.5 ? 'F' : 'J'));

      const typeCode = `${dim1}${dim2}${dim3}${dim4}`;

      // 저장할 테스트 결과 객체
      const testResult = {
        date: dateStr,
        time: timeStr,
        typeCode: typeCode,
        answers: testResults,
        dimensions: {
          dim1: { code: dim1, score: { p: pScore, o: oScore } },
          dim2: { code: dim2, score: { r: rScore, s: sScore } },
          dim3: { code: dim3, score: { e: eScore, i: iScore } },
          dim4: { code: dim4, score: { f: fScore, j: jScore } }
        }
      };

      // 기존 결과 불러오기
      const existingResults = JSON.parse(localStorage.getItem('theaterMBTIResults') || '[]');
      
      // 새 결과 추가 (최신 순으로 정렬)
      const updatedResults = [testResult, ...existingResults];
      
      // 로컬 스토리지에 저장
      localStorage.setItem('theaterMBTIResults', JSON.stringify(updatedResults));
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

  // 1. 참여(P) vs 관찰(O) 축 - 더 극적인 대비
  const pScore = sum([3, 8, 10, 19]); // 인터랙티브, 소극장 친밀, 새로운 배우, 소통
  const oScore = sum([0, 1, 11, 15]); // 드라마/비극, 코미디, 유명 배우, 한국적 정서
  const dim1 = pScore > oScore ? 'P' : (pScore < oScore ? 'O' : (Math.random() > 0.5 ? 'P' : 'O'));

  // 2. 현실(R) vs 상징(S) 축 - 가중치 적용
  const rScore = sum([5, 7, 12, 16]) * 1.2; // 사회적 메시지, 각색 작품, 감동, 라이브 연기
  const sScore = sum([2, 6, 13, 17]) * 1.1; // 실험적 연극, 상징적 작품, 철학적 작품, 대사 중심
  const dim2 = rScore > sScore ? 'R' : (rScore < sScore ? 'S' : (Math.random() > 0.5 ? 'R' : 'S'));

  // 3. 감성(E) vs 이성(I) 축 - 역방향 가중치
  const eScore = sum([0, 4, 12, 15]) * 1.15; // 드라마/비극, 몸짓/무언극, 감동, 한국적 정서
  const iScore = sum([2, 6, 13, 17]) * 1.25; // 실험적 연극, 상징적 작품, 철학적 작품, 대사 중심
  const dim3 = eScore > iScore ? 'E' : (eScore < iScore ? 'I' : (Math.random() > 0.5 ? 'E' : 'I'));

  // 4. 즉흥(F) vs 구조(J) 축 - 극단적 대비
  const fScore = sum([3, 4, 18, 19]) * 1.3; // 인터랙티브, 몸짓/무언극, 짧고 가벼운, 소통
  const jScore = sum([7, 8, 9, 20]) * 1.1; // 각색 작품, 소극장, 대규모 공연, 서사 깊은
  const dim4 = fScore > jScore ? 'F' : (fScore < jScore ? 'J' : (Math.random() > 0.5 ? 'F' : 'J'));

  const typeCode = `${dim1}${dim2}${dim3}${dim4}`;

  const typeDescription = {
    P: '직접 참여하고 소통하는 것을 즐기는 성향',
    O: '관객으로서 작품을 관찰하고 감상하는 성향',
    R: '현실적이고 구체적인 메시지를 선호하는 성향',
    S: '상징적이고 해석이 필요한 작품을 즐기는 성향',
    E: '감정적 몰입과 직관적 감상을 선호하는 성향',
    I: '이성적 분석과 사고를 자극하는 작품을 선호하는 성향',
    F: '즉흥적이고 자유로운 형식을 즐기는 성향',
    J: '구조적이고 체계적인 작품 구성을 선호하는 성향'
  };

  const genres = [];
  if (dim1 === 'P') genres.push('인터랙티브 연극', '참여형 공연');
  else genres.push('전통 연극', '클래식 작품');
  if (dim2 === 'R') genres.push('사회극', '리얼리즘 드라마');
  else genres.push('실험극', '상징극');
  if (dim3 === 'E') genres.push('감동 드라마', '비극');
  else genres.push('철학극', '사고극');
  if (dim4 === 'F') genres.push('즉흥극', '자유극');
  else genres.push('구조극', '서사극');

  const plays = [];
  if (dim1 === 'P') plays.push('인터랙티브 쇼', '참여형 워크숍');
  else plays.push('햄릿', '오이디푸스');
  if (dim2 === 'R') plays.push('사회 문제극', '현실 드라마');
  else plays.push('상징극', '실험 작품');
  if (dim3 === 'E') plays.push('감동 비극', '감정 드라마');
  else plays.push('철학적 작품', '사고 자극극');
  if (dim4 === 'F') plays.push('즉흥극 쇼', '자유 형식극');
  else plays.push('서사극', '구조적 작품');

  return (
    <div className="testresults-container">
      <Topnav />
      <div style={{ textAlign: 'center', margin: '20px 0', color: '#FFD700', fontSize: '1.5rem', fontWeight: 'bold' }}>조재현</div>

      <div className="testresults-content">
        <div className="testresults-header">
          <h1 className="testresults-title">Your Theater MBTI</h1>
          <p className="testresults-subtitle">20개 문항 기반 개인 성향 분석</p>
        </div>

        <section className="type-hero">
          <div className="type-code">{typeCode}</div>
          <p className="type-desc">
            {typeDescription[dim1]} · {typeDescription[dim2]} · {typeDescription[dim3]} · {typeDescription[dim4]}
          </p>
        </section>

        <section className="recommendations">
          <h2>추천 장르</h2>
          <div className="tag-list">
            {genres.map((g, i) => (
              <span key={i} className="tag">{g}</span>
            ))}
          </div>
        </section>

        <section className="recommendations">
          <h2>추천 작품</h2>
          <div className="cards">
            {plays.map((p, i) => (
              <div key={i} className="card">{p}</div>
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
