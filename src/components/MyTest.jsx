import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './MyTest.css';

const MyTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 연극 입문자 흥미 유도형 20문항 (7점 척도: 1 매우 그렇지 않다 ~ 7 매우 그렇다)
  const questions = [
    "빠르게 몰입되는 강한 감정선의 로맨스를 보면 심장이 먼저 반응한다.",
    "사랑/관계가 이야기의 중심이면 더 끌린다.",
    "긴 독백과 사유할 거리가 많은 작품을 좋아한다.",
    "공연 후 해설/프로그램북을 읽으며 의미를 곱씹는 편이다.",
    "팽팽한 긴장감과 다소 어두운 분위기에 잘 몰입한다.",
    "권력·욕망·도덕적 선택의 무게를 다루는 서사를 선호한다.",
    "재치 있는 말싸움(티키타카)과 위트 넘치는 대사에 쾌감을 느낀다.",
    "시적이고 아름다운 문장(운율·수사)을 특히 좋아한다.",
    "정체성 뒤바뀜/오해가 만드는 상황 코미디가 재미있다.",
    "시각 효과·무대 마술·신체 퍼포먼스가 돋보이면 더 즐겁다.",
    "환상적/동화 같은 분위기**의 공연을 보면 기분이 좋아진다.",
    "가족·세대·책임 같은 주제를 다루면 오래 여운이 남는다.",
    "선한 의지·구원·연대의 메시지에 약하다.",
    "길어도 좋으니 차분한 템포로 관계·심리를 깊게 파는 작품이 좋다.",
    "극적 결말도 기꺼이 받아들이는 편이다.",
    "형식 실험(4의 벽 깨기, 시간 파편화 등)이 있어도 흥미롭다.",
    "러닝타임 2시간 30분+도 집중이 유지된다.",
    "자막/해설이 있으면 복잡한 구조도 따라갈 자신이 있다.",
    "배우의 표정·호흡을 가까이서 느끼는 걸 좋아한다.",
    "공연 후 어떻게 살아야 하지? 같은 질문을 품게 되는 작품이 좋다."
];

const handleAnswer = (questionIndex, value) => {
    setAnswers(prev => ({
    ...prev,
    [questionIndex]: value
    }));
};

const getAnswerLabel = (value) => {
const labels = {
    1: "매우 그렇지 않다",
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
        <h1 className="mytest-title">My Test</h1>
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
        <div key={index} className="question-card">
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
