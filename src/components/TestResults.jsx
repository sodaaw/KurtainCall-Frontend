// src/TestResults.jsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestResults.css';

// (A) 허용 카테고리(6종)
const VALID_CATS = ['Comedy', 'Romance', 'Horror', 'Tragedy', 'Thriller', 'Musical'];

// (B) 캐릭터별 가중치 (문항 1~20, 무응답=4점)
const WEIGHTS = {
  Romeo:        {1:2, 2:2, 11:1},
  Hamlet:       {3:2, 4:2, 14:1, 17:1},
  Macbeth:      {5:2, 6:1, 15:1, 16:1, 17:1},
  LadyMacbeth:  {6:2, 5:1, 15:1, 14:1},
  Viola:        {9:2, 11:1, 7:1},
  Beatrice:     {7:2, 8:2, 9:1},
  Puck:         {10:2, 11:2, 16:1},
  Cordelia:     {12:2, 20:2, 15:1},
  Cyrano:       {8:2, 4:1, 7:1, 14:1},
  JeanValjean:  {13:2, 12:1, 20:1, 15:1},
};

// (C) 캐릭터 메타 + 추천 카테고리(해시태그로 노출)
const CHARACTER_META = {
  Romeo: {
    title: '로미오형 – 즉흥적 낭만주의자',
    why: '감정이 먼저 움직이고, 빠르게 달리는 로맨스에 심장이 바로 반응한다고 하셨어요. 큰 감정선이 치고 나가는 이야기에서 가장 행복해지는 타입이에요.',
    mood: ['로맨틱 드라마', '청춘극', '뮤지컬'],
    imageSrc: '/images/1. 로미오.png',
    // ← 결과 하단 해시태그에 표시될 추천 카테고리
    recommend: ['Romance', 'Tragedy', 'Musical'],
    tip: (q18, q19) => ({
      seat: q19 >= 5 ? '근거리(감정선·호흡)' : '중간열(균형)',
      subtitle: q18 <= 3 ? '자막/해설 권장' : '자막 선택'
    }),
  },
  Hamlet: {
    title: '햄릿형 – 깊이 사색하는 관객',
    why: '길어도 좋은 대사와 생각할 거리가 많은 작품을 좋아한다고 하셨죠. 인물의 마음 결을 따라가며 의미를 오래 씹는 편이에요.',
    mood: ['심리극', '고전 비극'],
    imageSrc: '/images/2. 햄릿.png',
    recommend: ['Tragedy'],
    tip: (q18, q19) => ({
      seat: q19 >= 5 ? '중전방 중앙' : '중간열',
      subtitle: q18 <= 3 ? '자막 권장' : '자막 선택'
    }),
  },
  Macbeth: {
    title: '맥베스형 – 강렬한 속도·야망 서사 선호',
    why: '팽팽한 긴장감과 거침없는 연출에 쾌감을 느낀다고 답하셨어요. 템포 빠르고 에너지 높은 이야기에서 몰입이 최대로 올라갑니다.',
    mood: ['스릴러 드라마', '다크 클래식'],
    imageSrc: '/images/3. 맥베스.png',
    recommend: ['Thriller', 'Tragedy', 'Horror'],
    tip: (q18) => ({ seat: '중간열', subtitle: q18 <= 3 ? '자막 권장' : '자막 선택' }),
  },
  LadyMacbeth: {
    title: '레이디 맥베스형 – 주도권과 심리의 파고',
    why: '욕망과 권력의 심리전, 선택의 무게에 끌린다고 하셨어요. 인물의 결단이 판을 뒤집는 순간에 강하게 몰입하는 타입이에요.',
    mood: ['심리극', '권력·도덕 갈등'],
    imageSrc: '/images/4. 레이디 맥베스.png',
    recommend: ['Thriller', 'Tragedy'],
    tip: (q18, q19) => ({ seat: q19 >= 5 ? '근·중거리' : '중간열', subtitle: q18 <= 3 ? '자막 권장' : '자막 선택' }),
  },
  Viola: {
    title: '비올라형(〈십이야〉) – 재치와 변장의 코미디 감각',
    why: '가볍고 유쾌한 톤, 위트 있는 상황극이 취향이라고 하셨죠. 정체성 뒤바뀜과 오해 게임에서 오는 유머를 특히 즐깁니다.',
    mood: ['로맨틱 코미디', '상황극'],
    imageSrc: '/images/5. 비올라형.png',
    recommend: ['Comedy', 'Romance'],
    tip: (q18) => ({ seat: '사이드 중간열', subtitle: q18 <= 3 ? '해설 추천' : '자막 선택' }),
  },
  Beatrice: {
    title: '베아트리체형(〈헛소동〉) – 말맛과 티키타카 애호가',
    why: '말맛 좋은 대사, 빠른 티키타카에 설렌다고 하셨어요. 재치 있는 설전과 밀당 로맨스에서 재미를 가장 크게 느끼는 타입이에요.',
    mood: ['코미디 오브 매너스', '대사 위주 로코'],
    imageSrc: '/images/6. 베아트라체.png',
    recommend: ['Comedy', 'Romance'],
    tip: (q18) => ({ seat: '중간열', subtitle: q18 <= 3 ? '해설 추천' : '자막 선택' }),
  },
  Puck: {
    title: '퍽형(〈한여름밤의 꿈〉) – 판타지·무대마술 애호가',
    why: '시각적인 장치와 환상적인 분위기에 끌린다고 하셨어요. 몸으로 느끼는 리듬과 무대의 ‘마술’이 있는 작품을 좋아합니다.',
    mood: ['판타지극', '넌버벌'],
    imageSrc: '/images/7. 퍽.png',
    recommend: ['Comedy', 'Musical'],
    tip: () => ({ seat: '중·후열(전경)', subtitle: '자막 불필요' }),
  },
  Cordelia: {
    title: '코델리아형(〈리어왕〉) – 진정성과 가족 드라마 지향',
    why: '관계의 진심, 책임과 윤리 같은 주제가 마음에 남는다고 하셨어요. 조용하지만 묵직한 감정선을 오래 품는 타입이에요.',
    mood: ['가족 비극', '인물 드라마'],
    imageSrc: '/images/8. 코델리아.png',
    recommend: ['Tragedy'],
    tip: (q18) => ({ seat: '근거리', subtitle: q18 <= 3 ? '자막 권장' : '자막 선택' }),
  },
  Cyrano: {
    title: '시라노형 – 언어와 낭만의 미학',
    why: '시적인 표현과 우아한 낭만을 즐긴다고 하셨죠. 말의 리듬과 운율, 고전적 매무새에서 큰 만족을 느낍니다.',
    mood: ['낭만드라마', '클래식 코미디'],
    imageSrc: '/images/9. 시라노.png',
    recommend: ['Romance', 'Comedy'],
    tip: (q18) => ({ seat: '중간열(대사 밸런스)', subtitle: q18 <= 3 ? '자막 권장' : '자막 선택' }),
  },
  JeanValjean: {
    title: '장 발장형(〈레 미제라블〉) – 구원·도덕의 휴먼 드라마',
    why: '선한 의지와 구원의 이야기에 약하다고 하셨어요. 사람을 살리는 선택과 눈물 포인트에서 깊게 흔들리는 타입이에요.',
    mood: ['휴먼 드라마', '대형 뮤지컬'],
    imageSrc: '/images/10. 장발장.png',
    recommend: ['Musical', 'Tragedy'],
    tip: (q18) => ({ seat: '중·후열(스케일)', subtitle: q18 <= 3 ? '해설 추천' : '자막 선택' }),
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
            당신의 연극 캐릭터는<br />
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
              <strong>관람 팁</strong> : 좌석 {tips.seat} · {tips.subtitle}
            </li>
          )}
          <li>
            <strong>캐릭터 특징</strong> : {resultMeta.title}은(는) 연극을 통해 새로운 경험과
            감정을 찾는 타입이에요. 무대 위의 이야기에 깊이 몰입할 수 있는 관객이 될 거예요!
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

      {/* === 추천 카테고리 해시태그 (맨 아래) === */}
      <div className="recommend-hashtags" style={{ marginTop: 28 }}>
        <h3 className="hashtags-title">추천 카테고리</h3>
        <div className="hashtag-wrap" role="group" aria-label="추천 카테고리">
          {recCats.length === 0 ? (
            <span style={{ opacity: 0.7 }}>추천 카테고리가 없습니다.</span>
          ) : (
            recCats.map((cat) => (
              <button
                key={cat}
                className="hashtag"
                onClick={() => goCategory(cat)}
                aria-label={`${cat} 카테고리로 이동`}
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
