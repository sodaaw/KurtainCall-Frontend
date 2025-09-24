import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './MyTest.css';

const MyTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 문화생활 취향 테스트 20문항 (7점 척도: 1 전혀 그렇지 않다 ~ 7 매우 그렇다)
  const questions = [
    "전시회 가면 작품보다도 공간 분위기(조명, 향기, 음악)에 더 끌리나요?",
    "연극 볼 때 배우의 대사보다 표정이나 몸짓을 더 유심히 보나요?",
    "뮤지컬의 화려한 연출보다 작은 극장의 소박한 몰입감이 더 좋나요?",
    "카페에서는 대화보다 창밖 풍경이나 음악 감상에 빠지는 편인가요?",
    "지역 축제의 시끌벅적한 활기를 즐기는 편인가요?",
    "박물관 전시를 볼 때, 해설판 글을 꼼꼼히 읽는 타입인가요?",
    "즉흥적으로 길거리 공연을 보면 그냥 지나치지 않고 멈춰서 보나요?",
    "조용한 공간에서 혼자만의 감상 시간을 갖는 게 꼭 필요하다고 느끼나요?",
    "전시회에서 사진 찍는 것보다 작품 앞에서 오래 머무는 걸 선호하나요?",
    "연극·공연을 본 뒤 감상을 누군가와 이야기 나누고 싶나요?",
    "카페에 갈 때 맛보다 인테리어와 분위기를 우선 고려하나요?",
    "새로운 도시를 방문하면 미술관·박물관을 먼저 찾아가는 편인가요?",
    "음악 공연에서 가사보다는 악기 소리와 리듬에 집중하나요?",
    "전시회 같은 문화생활은 혼자서도 충분히 즐길 수 있나요?",
    "공연 볼 때 무대 장치나 조명 효과에 크게 감동하나요?",
    "사람 많은 곳의 활기에서 오히려 에너지를 얻는 편인가요?",
    "작은 독립 카페나 숨은 공연장을 탐험하는 걸 좋아하나요?",
    "전시나 공연을 다녀오면 기록(메모, 그림, 글 등)을 남기나요?",
    "큰 콘서트 같은 강렬한 경험보다 차분한 전시 감상을 선호하나요?",
    "문화생활은 '특별한 날'보다는 일상 속에 자연스럽게 녹아 있어야 한다고 생각하나요?"
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
        <h1 className="mytest-title">문화생활 취향 테스트</h1>
        <p className="test-description">잠깐의 여유 시간, 재미있는 테스트와 함께<br></br>나만의 문화생활 스타일을 확인해보세요.</p>
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
