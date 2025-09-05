// src/TestResults.jsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestResults.css';

// (A) 허용 카테고리(4종)
const VALID_CATS = ['Sentinel', 'Guardian', 'Navigator', 'Unaware'];

// (B) 안전 유형별 가중치 (문항 1~20, 무응답=4점)
const WEIGHTS = {
  Sentinel:     {1:2, 2:2, 3:2, 4:2, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 17:2, 18:2, 19:2, 20:2},
  Guardian:     {6:3, 15:3, 18:2, 20:2, 1:1, 2:1, 5:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 17:1, 19:1},
  Navigator:    {13:3, 17:2, 19:2, 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 18:1, 20:1},
  Unaware:      {14:3, 15:2, 16:3, 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 17:1, 18:1, 19:1, 20:1}
};

// (C) 안전 유형 메타 + 추천 카테고리(해시태그로 노출)
const CHARACTER_META = {
  Sentinel: {
    title: 'Sentinel (경계자) – 위험 신호에 민감한 예방형',
    why: '혼잡한 곳에서 불안감을 느끼고, 주변 상황 변화를 민감하게 감지한다고 답하셨어요. 비상구 위치 확인부터 안전 장치까지 모든 것을 미리 체크하는 예방적 성향이 강한 타입이에요.',
    mood: ['위험 감지', '예방 행동', '안전 체크'],
    imageSrc: '/images/1. 로미오.png',
    recommend: ['Sentinel'],
    tip: (q18, q19) => ({
      seat: '출입구 근처',
      subtitle: '스마트 알림 앱 적극 활용'
    }),
  },
  Guardian: {
    title: 'Guardian (수호자) – 공동체 안전을 중시하는 타입',
    why: '친구나 가족의 안전을 걱정하고, 사고 뉴스를 보면 대비책을 생각한다고 하셨어요. 자신보다 주변 사람들의 안전을 더 의식하는 공동체형 안전 의식이 강한 타입이에요.',
    mood: ['공동체 안전', '타인 배려', '사회적 책임'],
    imageSrc: '/images/2. 햄릿.png',
    recommend: ['Guardian'],
    tip: (q18, q19) => ({
      seat: '중앙 위치',
      subtitle: '가족/친구와 함께 이용'
    }),
  },
  Navigator: {
    title: 'Navigator (대처가) – 위기 상황에서 침착한 타입',
    why: '위험한 상황에서 침착하게 행동할 자신이 있고, 스마트 기기로 경보를 받는다면 적극 활용하겠다고 답하셨어요. 평소 대비는 소홀하지만 위기 상황에서는 냉정한 판단력을 가진 타입이에요.',
    mood: ['침착함', '기술 활용', '위기 대응'],
    imageSrc: '/images/3. 맥베스.png',
    recommend: ['Navigator'],
    tip: (q18) => ({ 
      seat: '유동적 위치', 
      subtitle: '스마트 기기 필수' 
    }),
  },
  Unaware: {
    title: 'Unaware (안전 불감형) – 위험을 과소평가하는 타입',
    why: '사람 많은 곳에서도 "설마 사고 나겠어?"라고 대수롭지 않게 여기고, 군중 속에서 신체 접촉이 잦아도 별로 신경 안 쓴다고 하셨어요. 위험을 과소평가하는 안전 불감증이 있는 타입이에요.',
    mood: ['안전 불감', '과소평가', '무관심'],
    imageSrc: '/images/4. 레이디 맥베스.png',
    recommend: ['Unaware'],
    tip: (q18, q19) => ({ 
      seat: '어디든 상관없음', 
      subtitle: '기초 안전 교육 필요' 
    }),
  },
};

// (D) 점수 계산 유틸
function toAnswerArray(objLike) {
  return Array.from({ length: 20 }, (_, i) => {
    const v = Number(objLike?.[i]);
    return Number.isFinite(v) ? v : 4;
  });
}
function scoreCharacters(answers20) {
  const raw = {};
  for (const [name, wm] of Object.entries(WEIGHTS)) {
    let sum = 0, wsum = 0;
    for (const [qStr, w] of Object.entries(wm)) {
      const idx = Number(qStr) - 1;
      sum  += (answers20[idx] ?? 4) * w;
      wsum += w;
    }
    raw[name] = { raw: sum, norm: sum / (7 * wsum), wsum };
  }
  const ranked = Object.entries(raw).sort((a, b) => b[1].raw - a[1].raw);
  const [topKey] = ranked[0];
  return { topKey, detail: raw, ranked };
}

// (E) 본 컴포넌트
const TestResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { answers20, topKey, resultMeta, tips, ranked, recCats } = useMemo(() => {
    const arr = toAnswerArray(state?.testResults || {});
    const { topKey, ranked } = scoreCharacters(arr);
    const meta = CHARACTER_META[topKey];
    const q18 = arr[17];
    const q19 = arr[18];
    const tipObj = meta?.tip ? meta.tip(q18, q19) : null;

    // 추천 카테고리 정리(VALID_CATS만, 중복 제거)
    const uniq = Array.from(
      new Set((meta?.recommend || []).filter((c) => VALID_CATS.includes(c)))
    );

    return { answers20: arr, topKey, resultMeta: meta, tips: tipObj, ranked, recCats: uniq };
  }, [state]);

  // 라우팅 보호 + 기록 저장
  useEffect(() => {
    if (!state?.testResults) {
      navigate('/test/my-test', { replace: true });
      return;
    }
    const prev = JSON.parse(localStorage.getItem('theaterMBTIResults') || '[]');
    prev.push({
      timestamp: Date.now(),
      answers: answers20,
      top: topKey,
      scores: ranked.reduce((acc, [k, v]) => { acc[k] = v.norm; return acc; }, {}),
    });
    localStorage.setItem('theaterMBTIResults', JSON.stringify(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!resultMeta) return null;

  const goCategory = (cat) =>
    navigate(`/genre?category=${encodeURIComponent(cat.toLowerCase())}`);

  return (
    <div className="testresults-container">
      <Topnav />

      {/* 히어로 */}
      <div className="results-hero">
        <div className="hero-text">
          <h1 className="hero-title">
            당신의 안전 유형은<br />
            <span className="hero-emph">{resultMeta.title}</span>
          </h1>
        </div>

        <div className="hero-avatar">
          <img
            src={resultMeta.imageSrc || '/images/1. 로미오.png'}
            alt={resultMeta.title}
            onError={(e) => (e.currentTarget.src = '/images/1. 로미오.png')}
          />
        </div>
      </div>

      {/* 설명 카드 */}
      <div className="results-card">
        <ul className="bullet-list">
          <li><strong>왜 이 결과?</strong> {resultMeta.why}</li>
          <li><strong>추천 무드</strong> : {resultMeta.mood.join(' · ')}</li>
          {tips && (
                      <li>
            <strong>안전 팁</strong> : 위치 {tips.seat} · {tips.subtitle}
          </li>
          )}
          <li>
            <strong>안전 특징</strong> : {resultMeta.title}은(는) 군중 안전에 대한 인식과 대응 방식이
            독특한 타입이에요. 스마트 매트와 같은 안전 기술을 통해 더 나은 안전 환경을 만들어갈 수 있어요!
          </li>
        </ul>
      </div>

      {/* 액션 버튼 */}
      <div className="results-actions">
        <button className="primary" onClick={() => navigate('/test/my-test')}>
          다시 하기
        </button>
        <button className="secondary" onClick={() => navigate('/test/database')}>
          내 기록 보기
        </button>
      </div>

      {/* === 추천 안전 유형 해시태그 (맨 아래) === */}
      <div className="recommend-hashtags" style={{ marginTop: 28 }}>
        <h3 className="hashtags-title">안전 유형 정보</h3>
        <div className="hashtag-wrap" role="group" aria-label="안전 유형 정보">
          {recCats.length === 0 ? (
            <span style={{ opacity: 0.7 }}>추천 안전 유형이 없습니다.</span>
          ) : (
            recCats.map((cat) => (
              <button
                key={cat}
                className="hashtag"
                onClick={() => goCategory(cat)}
                aria-label={`${cat} 안전 유형 정보`}
              >
                #{cat}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 개발용 점수 확인 (원하면 주석 해제) */}
      {/* <details className="debug" style={{ marginTop: 16 }}>
        <summary>점수 보기 (개발용)</summary>
        <pre>{JSON.stringify(ranked, null, 2)}</pre>
      </details> */}
    </div>
  );
};

export default TestResults;
