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
    "혼잡한 곳에 있으면 불안하거나 긴장한다.",
    "주변 사람들의 움직임 변화를 민감하게 눈치챈다.",
    "행사나 축제에 가면 '비상구' 위치부터 확인하는 편이다.",
    "군중 속에서 갑자기 큰 소리/진동이 나면 바로 반응한다.",
    "안전 관련 안내방송이 나오면 주의 깊게 듣는다.",
    "친구나 가족이 위험을 무시하면 불안하다.",
    "안전 장치(경보기, 센서, CCTV)가 있으면 안심된다.",
    "비상 상황 대피 훈련을 적극적으로 참여하는 편이다.",
    "낯선 공간에서는 출입구/탈출구를 자동으로 체크한다.",
    "사람들이 몰려서 밀릴 때 곧 위험해질 수 있다고 생각한다.",
    "지역 축제·행사에 가면 안전 요원 수를 확인하게 된다.",
    "위험 징후(과밀, 소음, 압박 등)를 빨리 눈치챈다.",
    "위험한 상황에서 침착하게 행동할 자신이 있다.",
    "사람 많은 곳에서도 '설마 사고 나겠어?'라고 대수롭지 않게 여긴다.",
    "군중 안전 문제는 개인보다 사회가 해결해야 한다고 생각한다.",
    "군중 속에서 신체 접촉이 잦아도 별로 신경 안 쓴다.",
    "비상벨·알람이 울리면 무조건 원인을 확인한다.",
    "사고 관련 뉴스를 보면 '나도 대비해야겠다'라고 생각한다.",
    "군중 상황에서 스마트 기기로 경보를 받는다면 적극 활용할 것이다.",
    "군중 사고는 언제든 내 주변에서도 일어날 수 있다고 생각한다."
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
        <p className="test-description">군중 속, 나는 얼마나 안전에 민감할까?</p>
        <button className="previous-results-btn" onClick={() => navigate('/test/database')}>
            Previous Results
        </button>
        </div>
    </div>

    {/* 진행률 표시 */}
    <div className="progress-section">
        <div className="progress-bar">
        <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
        ></div>
        </div>
        <p className="progress-text">
        {Object.keys(answers).length} / {questions.length} 완료
        </p>
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
        Submit
        </button>
    </div>
    </div>
</div>
);
};

export default MyTest;
