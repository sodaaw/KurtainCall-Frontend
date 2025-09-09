import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './MyTest.css';

const MyTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 안전 불감도 테스트 20문항 (7점 척도: 1 전혀 그렇지 않다 ~ 7 매우 그렇다)
  const questions = [
    "사람 바글바글 몰리면… 내 심장도 EDM 비트로 뛰나요?",
    "뒤에서 누가 살짝만 밀어도 ‘어 누구야 지금?’ 모드 되나요?",
    "친구들은 포토존 먼저 보는데, 난 비상구 찾는 게 국룰인가요?",
    "불꽃놀이 ‘펑!’에 남들은 ‘와~’ 하는데, 나만 점프해서 심장 놓치나요?",
    "다들 수다 중인데 나만 ‘쉿, 안내방송 듣자’ 되는 타입인가요?",
    "친구가 ‘걱정 마~ 안 죽어~’ 하면, 속으로 ‘이미 불안하다 임마…’ 하나요?",
    "CCTV 하나만 보여도 ‘아 오케이, 여긴 안전 존’ 되는 타입인가요?",
    "대피 훈련할 때 몰래 빠지는 대신, 진심으로 달려나가나요?",
    "공연장 들어가서 무대 조명보다 먼저 ‘비상구 몇 개?’ 세나요?",
    "앞사람이랑 밀착되면 ‘연애 아니고 재난이다’부터 떠오르나요?",
    "무대 앞에서 가수 찾기 전에 형광 조끼 몇 명 있나 확인하나요?",
    "사람 몰려서 숨 막히면 ‘나만 숨찬 거 아니지?’ 바로 캐치하나요?",
    "만약 사고 나면, 드라마 주인공처럼 ‘다들 진정해!’ 모드 가능하나요?",
    "사람이 개미떼처럼 몰려도 ‘에이 설마~’ 하면서 치킨 생각하나요?",
    "군중 안전? 그건 내 일이 아니고 ‘국가가 알아서 해’ 모드인가요?",
    "뒤에서 계속 치이는 데도 ‘아 이게 인싸 감성인가?’ 하고 넘어가나요?",
    "알람 울리면 ‘누구야? 뭐야? 어디야?’ 탐정 모드 바로 ON 되나요?",
    "뉴스에서 사고 나오면 ‘헐… 나도 다음엔 물 챙겨가야겠다’ 하나요?",
    "폰에 ‘혼잡 주의’ 알림 오면 ‘아 네~’ 하면서 바로 코스 바꾸나요?",
    "군중 사고, 다큐에서만 있는 게 아니라 ‘내 주말에도 등장 가능’이라 생각하나요?"
  ];
  

const handleAnswer = (questionIndex, value) => {
    setAnswers(prev => ({
    ...prev,
    [questionIndex]: value
    }));
    
    // 질문 선택 후 해당 질문이 화면 중앙에 오도록 부드럽게 스크롤
    setTimeout(() => {
        const questionElement = document.getElementById(`question-${questionIndex}`);
        if (questionElement) {
            const elementRect = questionElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
            
            window.scrollTo({
                top: middle,
                behavior: 'smooth'
            });
        }
    }, 100); // 약간의 지연을 두어 애니메이션이 자연스럽게 보이도록
};

const getAnswerLabel = (value) => {
const labels = {
    1: "전혀 그렇지 않다",
    2: "그렇지 않다",
    3: "약간 그렇지 않다",
    4: "보통이다",
    5: "약간 그렇다",
    6: "그렇다",
    7: "매우 그렇다"
};
return labels[value] || "";
};

const getProgressPercentage = () => {
return (Object.keys(answers).length / questions.length) * 100;
};

const handleSubmit = () => {
if (Object.keys(answers).length === questions.length) {
    // 모든 질문에 답했을 때 처리
    console.log('Test completed:', answers);
    // TestResults 페이지로 이동
    navigate('/test/results', { state: { testResults: answers } });
} else {
    alert('모든 질문에 답해주세요.');
}
};

return (
<div className="mytest-container">
    <Topnav />
    
    <div className="mytest-content">
    <div className="mytest-header">
        <div className="header-content">
        <h1 className="mytest-title">안전 유형 테스트</h1>
        <p className="test-description">잠깐의 여유 시간, 재미있는 테스트와 함께<br></br>안전 감각도 확인해보세요.</p>
        {/* <button className="previous-results-btn" onClick={() => navigate('/test/database')}>
            이전 결과 보기
        </button> */}
        </div>
    </div>

    {/* 진행률 표시 */}
    <div className="progress-section">
        <p className="progress-text">
            {Object.keys(answers).length} / {questions.length} 완료
        </p>
        <div className="progress-bar">
        <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
        ></div>
        </div>
    </div>

    {/* 질문 섹션 */}
    <div className="questions-section">
        {questions.map((question, index) => (
        <div key={index} id={`question-${index}`} className="question-card">
            <h3 className="question-text">{question}</h3>
            
            {/* 7단계 응답 척도 */}
            <div className="response-scale">
            <div className="scale-labels">
                <span className="label-left">그렇지 않다</span>
                <span className="label-right">그렇다</span>
            </div>
            
            <div className="scale-circles">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <button
                    key={value}
                    className={`scale-circle ${answers[index] === value ? 'selected' : ''} ${
                    value <= 3 ? 'green' : value === 4 ? 'gray' : 'purple'
                    }`}
                    onClick={() => handleAnswer(index, value)}
                    aria-label={`${getAnswerLabel(value)} 선택`}
                >
                    {answers[index] === value && (
                    <div className="selected-indicator"></div>
                    )}
                </button>
                ))}
            </div>
            
            <div className="scale-values">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <span key={value} className="value-label">
                    {value}
                </span>
                ))}
            </div>
            </div>
        </div>
        ))}
    </div>

    {/* 제출 버튼 */}
    <div className="submit-section">
        <button 
        className="submit-btn"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== questions.length}
        >
        결과 보기
        </button>
    </div>
    </div>
</div>
);
};

export default MyTest;
