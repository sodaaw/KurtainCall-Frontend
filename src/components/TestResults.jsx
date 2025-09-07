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
    title: 'Sentinel (경계자)',
    why: '혼잡한 곳에서 불안감을 느끼고, 주변 상황 변화를 민감하게 감지한다고 답하셨어요. 비상구 위치 확인부터 안전 장치까지 미리 체크하는 예방적 성향이 강한 타입이에요.',
    mood: ['위험 민감', '예방', '대비'],
    imageSrc: '/images/1.Sentinel.png',
    recommend: ['Sentinel'],
    strengths: '위험 신호를 빠르게 감지하고, 사전에 대비해 사고 가능성을 줄입니다.',
    warnings: '불필요한 걱정이나 과도한 긴장으로 스트레스를 받을 수 있으니, 상황을 과장하지 않도록 주의하세요.',
    tip: (q18, q19) => ({
      seat: '출입구 근처',
      subtitle: '비상구 위치 먼저 확인, 스마트 알림 앱 활용'
    }),
  },
  Guardian: {
    title: 'Guardian (수호자)',
    why: '친구나 가족의 안전을 걱정하고, 사고 뉴스를 보면 대비책을 생각한다고 답하셨어요. 자신보다 주변 사람들의 안전을 더 의식하는 공동체형 성향이에요.',
    mood: ['공동체', '배려', '책임'],
    imageSrc: '/images/2.Guardian.png',
    recommend: ['Guardian'],
    strengths: '혼자가 아닌, 함께하는 사람들의 안전까지 고려해 더 큰 범위에서 위험을 예방합니다.',
    warnings: '타인을 챙기느라 정작 본인의 안전을 놓칠 수 있으니, 나 자신도 지켜야 한다는 균형을 유지하세요.',
    tip: (q18, q19) => ({
      seat: '중앙 위치',
      subtitle: '가족/친구와 함께, 연락 수단 미리 정하기'
    }),
  },
  Navigator: {
    title: 'Navigator (대처가)',
    why: '위험한 상황에서도 침착하게 행동할 자신이 있고, 스마트 기기로 경보를 받는다면 적극 활용하겠다고 답하셨어요. 평소 대비는 부족하지만 위기 상황에서는 냉정한 판단력을 발휘하는 타입이에요.',
    mood: ['침착', '기술 활용', '위기 대응'],
    imageSrc: '/images/3.Navigator.png',
    recommend: ['Navigator'],
    strengths: '위급 상황이 닥쳤을 때 당황하지 않고, 상황을 객관적으로 파악해 신속하게 대처할 수 있습니다.',
    warnings: '평소에 안전 대비를 소홀히 하기 쉬우므로, 기본적인 안전 규칙은 미리 익혀두는 것이 필요합니다.',
    tip: (q18) => ({ 
      seat: '유동적 위치', 
      subtitle: '위치 공유 기능 켜두기, 안전 앱 설치' 
    }),
  },
  Unaware: {
    title: 'Unaware (안전 불감형)',
    why: '사람 많은 곳에서도 "설마 사고 나겠어?"라고 대수롭지 않게 여기고, 군중 속에서 신체 접촉이 잦아도 별로 신경 쓰지 않는다고 답하셨어요. 위험을 과소평가하는 경향이 있는 타입이에요.',
    mood: ['무관심', '과소평가', '방심'],
    imageSrc: '/images/4.Unaware.png',
    recommend: ['Unaware'],
    strengths: '과도하게 긴장하지 않고 즐길 수 있는 태도 덕분에 축제를 편안하게 경험할 수 있습니다.',
    warnings: '위험 신호를 놓치거나 대피 타이밍을 놓칠 수 있으니, 안전 경보나 주변 안내 방송에 반드시 귀 기울이세요.',
    tip: (q18, q19) => ({ 
      seat: '어디든 상관없음', 
      subtitle: '비상구 위치 확인, 기본 안전 수칙 숙지' 
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
            <span className="hero-subtitle">당신의 안전 유형은</span><br />
            <span className="hero-emph" dangerouslySetInnerHTML={{__html: resultMeta.title.replace(':', ':<br />')}}></span>
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
          <li><strong>왜 이 결과가 나왔을까요?</strong> {resultMeta.why}</li>
          <li><strong>키워드</strong> : {resultMeta.mood.join(' · ')}</li>
          <li><strong>강점</strong> : {resultMeta.strengths}</li>
          <li><strong>주의할 점</strong> : {resultMeta.warnings}</li>
          {tips && (
            <li>
              <strong>안전 팁</strong> : {tips.subtitle}
            </li>
          )}
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
      {/* <div className="recommend-hashtags" style={{ marginTop: 28 }}>
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
      </div> */}

      {/* 개발용 점수 확인 (원하면 주석 해제) */}
      {/* <details className="debug" style={{ marginTop: 16 }}>
        <summary>점수 보기 (개발용)</summary>
        <pre>{JSON.stringify(ranked, null, 2)}</pre>
      </details> */}
    </div>
  );
};

export default TestResults;
