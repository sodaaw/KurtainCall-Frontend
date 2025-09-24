// src/TestResults.jsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestResults.css';

// (A) 허용 카테고리(6종)
const VALID_CATS = ['Explorer', 'Immerser', 'Connector', 'Seeker', 'Performer', 'Wanderer'];

// (B) 문화생활 유형별 가중치 (문항 1~20, 무응답=4점)
const WEIGHTS = {
  Explorer:     {1:3, 5:3, 7:3, 12:3, 17:3, 2:2, 11:2, 16:2, 3:1, 4:1, 6:1, 8:1, 9:1, 10:1, 13:1, 14:1, 15:1, 18:1, 19:1, 20:1},
  Immerser:     {4:3, 8:3, 9:3, 14:3, 19:3, 3:2, 13:2, 20:2, 1:1, 2:1, 5:1, 6:1, 7:1, 10:1, 11:1, 12:1, 15:1, 16:1, 17:1, 18:1},
  Connector:    {10:3, 16:3, 5:2, 6:2, 15:2, 1:1, 2:1, 3:1, 4:1, 7:1, 8:1, 9:1, 11:1, 12:1, 13:1, 14:1, 17:1, 18:1, 19:1, 20:1},
  Seeker:       {4:3, 8:3, 14:3, 20:3, 3:2, 9:2, 19:2, 1:1, 2:1, 5:1, 6:1, 7:1, 10:1, 11:1, 12:1, 13:1, 15:1, 16:1, 17:1, 18:1},
  Performer:    {2:3, 6:3, 15:3, 18:3, 13:2, 11:2, 17:2, 1:1, 3:1, 4:1, 5:1, 7:1, 8:1, 9:1, 10:1, 12:1, 14:1, 16:1, 19:1, 20:1},
  Wanderer:     {7:3, 12:3, 17:3, 5:2, 16:2, 18:2, 1:1, 2:1, 3:1, 4:1, 6:1, 8:1, 9:1, 10:1, 11:1, 13:1, 14:1, 15:1, 19:1, 20:1}
};

// (C) 문화생활 유형 메타 + 추천 카테고리(해시태그로 노출)
const CHARACTER_META = {
  Explorer: {
    title: 'Explorer (탐험가)',
    why: '새로운 전시·공연·카페를 적극적으로 탐험하고, 낯선 공간에서 설렘을 느낀다고 답하셨어요. 계획보다 "새로움" 자체를 추구하며 다양한 경험을 시도하는 타입이에요.',
    mood: ['호기심', '발견', '모험'],
    imageSrc: '/images/1. 로미오.png',
    recommend: ['Explorer'],
    strengths: '문화생활의 스펙트럼이 넓어, 다양한 분야와 장르를 접하며 폭넓은 시각을 형성합니다.',
    warnings: '깊이 있는 감상보다는 경험 "체크리스트"에만 집중할 수 있으니, 가끔은 한 곳에 오래 머물러 보세요.',
    tip: (q18, q19) => ({
      seat: '다양한 장소',
      subtitle: '전시·공연을 다녀온 뒤 기록(사진, 메모)을 남겨서 경험을 정리해보세요'
    }),
  },
  Immerser: {
    title: 'Immerser (몰입가)',
    why: '하나의 작품이나 공연에 오랜 시간 집중하며 깊게 몰입한다고 답하셨어요. 혼자 감상을 즐기며 조용한 환경을 선호하는 타입이에요.',
    mood: ['집중', '내면', '감정 연결'],
    imageSrc: '/images/2. 햄릿.png',
    recommend: ['Immerser'],
    strengths: '작품과 강렬한 정서적 교감을 경험하며, 한 편의 공연이나 전시에서 얻는 감동이 크고 오래 남습니다.',
    warnings: '혼자만의 세계에 치우쳐 주변 사람들과의 교류 기회를 놓칠 수 있으니, 가끔은 함께 즐겨보세요.',
    tip: (q18, q19) => ({
      seat: '조용한 자리',
      subtitle: '혼자 감상한 뒤에도 온라인 커뮤니티나 모임에서 감상을 나누면 몰입의 깊이를 확장할 수 있습니다'
    }),
  },
  Connector: {
    title: 'Connector (교류가)',
    why: '친구·가족·동료와 함께 문화생활을 즐기며, 감상을 대화와 교류로 확장한다고 답하셨어요. 혼자보다는 "같이"가 더 즐겁다고 느끼는 타입이에요.',
    mood: ['관계', '공유', '소통'],
    imageSrc: '/images/3. 멕베스.png',
    recommend: ['Connector'],
    strengths: '문화 경험을 통해 인간관계를 강화하고, 대화와 공감을 통해 즐거움이 배가됩니다.',
    warnings: '함께할 사람이 없을 경우 문화생활을 미루게 될 수 있으니, 혼자만의 경험에도 익숙해져보세요.',
    tip: (q18, q19) => ({
      seat: '함께 앉기 좋은 자리',
      subtitle: '혼자 갈 땐 체험형 전시나 소셜 분위기의 카페 같은 곳을 선택하면 자연스럽게 교류 기회를 가질 수 있습니다'
    }),
  },
  Seeker: {
    title: 'Seeker (치유가)',
    why: '전시·공연·카페 같은 공간을 통해 마음의 안정을 찾고 일상 속 피로를 해소한다고 답하셨어요. 문화생활을 "휴식의 도구"로 여기는 타입이에요.',
    mood: ['힐링', '회복', '안정'],
    imageSrc: '/images/4. 레이디 멕베스.png',
    recommend: ['Seeker'],
    strengths: '자신에게 맞는 문화적 환경을 선택해 스트레스를 줄이고 균형 잡힌 삶을 유지합니다.',
    warnings: '늘 편안한 경험만 고집하다 보면 새로운 장르나 강렬한 경험을 놓칠 수 있으니, 가끔은 도전해보세요.',
    tip: (q18, q19) => ({
      seat: '편안한 자리',
      subtitle: '익숙한 힐링 공간 외에도 가볍게 도전할 수 있는 신선한 공연·전시를 곁들이면 치유와 새로움의 균형을 찾을 수 있습니다'
    }),
  },
  Performer: {
    title: 'Performer (표현가)',
    why: '관람자이지만 동시에 자신이 무대에 서는 상상을 즐기고, 예술적 자극을 받으면 창작 욕구가 솟구친다고 답하셨어요. 예술의 디테일에 민감한 타입이에요.',
    mood: ['표현', '창조', '주체성'],
    imageSrc: '/images/5. 비올라형.png',
    recommend: ['Performer'],
    strengths: '예술의 디테일에 민감해 작품 속 의미나 창작자의 의도를 잘 캐치하며, 자신의 창작 활동으로 확장할 가능성이 큽니다.',
    warnings: '관람 중 "내가 하면 더 잘할 텐데"라는 비판적 시각에 머무를 수 있으니, 때론 타인의 작품을 있는 그대로 즐기는 여유가 필요합니다.',
    tip: (q18, q19) => ({
      seat: '무대 가까운 자리',
      subtitle: '관람 후 글쓰기, 드로잉, 짧은 퍼포먼스 등으로 감상을 표현하면 창작욕구를 해소하면서 경험의 가치가 배가됩니다'
    }),
  },
  Wanderer: {
    title: 'Wanderer (방랑가)',
    why: '큰 계획 없이 즉흥적으로 문화생활을 즐기며, 오늘의 기분과 상황에 따라 움직인다고 답하셨어요. 틀에 얽매이지 않고 자유롭게 즐기는 타입이에요.',
    mood: ['자유', '즉흥', '유연성'],
    imageSrc: '/images/6. 베아트라체.png',
    recommend: ['Wanderer'],
    strengths: '틀에 얽매이지 않고 다양한 경험을 폭넓게 접할 수 있으며, 예상치 못한 즐거움과 우연한 만남을 자주 경험합니다.',
    warnings: '계획이 없으니 원하는 공연·전시를 놓칠 수 있으니, 가볍게 문화 캘린더를 확인해보세요.',
    tip: (q18, q19) => ({
      seat: '어디든 자유롭게',
      subtitle: '즉흥성을 유지하되, 가볍게 문화 캘린더를 확인하거나 관심 분야 알림을 설정하면 놓치는 기회를 줄일 수 있습니다'
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
            <span className="hero-subtitle">당신의 문화생활 유형은</span><br />
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
              <strong>문화생활 팁</strong> : {tips.subtitle}
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
          전체결과 보기
        </button>
      </div>

      {/* === 추천 문화생활 유형 해시태그 (맨 아래) === */}
      {/* <div className="recommend-hashtags" style={{ marginTop: 28 }}>
        <h3 className="hashtags-title">문화생활 유형 정보</h3>
        <div className="hashtag-wrap" role="group" aria-label="문화생활 유형 정보">
          {recCats.length === 0 ? (
            <span style={{ opacity: 0.7 }}>추천 문화생활 유형이 없습니다.</span>
          ) : (
            recCats.map((cat) => (
              <button
                key={cat}
                className="hashtag"
                onClick={() => goCategory(cat)}
                aria-label={`${cat} 문화생활 유형 정보`}
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
