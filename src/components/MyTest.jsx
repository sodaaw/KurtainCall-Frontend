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
    "감정적으로 울림을 주는 드라마/비극적 연극에 더 끌린다.",
    "무겁기보다는 재미있고 웃음을 주는 코미디 연극에 더 끌린다.", 
    "익숙한 고전보다 새로운 시도나 실험적인 연극에 호기심이 많다.",
    "관객이 직접 참여하는 인터랙티브 공연에 관심이 있다.",
    "대사보다 배우의 몸짓, 움직임, 무언극에 매력을 느낀다.",
    "현실의 사회 문제를 다루는 사회성·메시지 중심 연극이 좋다.", 
    "단순한 이야기보다 상징적이고 해석이 필요한 작품을 즐긴다.", 
    "원작 소설이나 영화를 기반으로 한 각색 작품을 선호한다.", 
    "거대한 무대장치보다는 소극장에서 가까이 보는 친밀한 무대가 좋다.",
    "화려한 세트와 의상, 음악이 있는 대규모 공연에 끌린다.",
    "유명 배우가 출연하는 작품이면 더 보고 싶다.",
    "유명세보다 새로운 배우의 신선한 연기가 매력적이다.",
    "관람 중 눈물 날 만큼 감동받는 작품을 선호한다.", 
    "끝나고 나서도 오래 생각하게 하는 철학적 작품이 좋다.",
    "한국적 정서와 이야기를 담은 연극을 선호한다.", 
    "해외 희곡이나 외국 연극 스타일에 관심이 많다.",
    "무대보다 배우의 생생한 라이브 연기 자체를 집중해서 본다.", 
    "시각적 효과보다 대사의 힘과 대화 중심 전개가 더 끌린다.",
    "짧고 가볍게 볼 수 있는 연극이 좋다.",
    "길더라도 서사 깊은 작품을 끝까지 따라가는 것을 즐긴다"
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
