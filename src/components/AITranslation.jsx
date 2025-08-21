import React, { useState } from 'react';
import Topnav from './Topnav';
import './AITranslation.css';

const AITranslation = () => {
  const [userName, setUserName] = useState('User');
  const [isListening, setIsListening] = useState(false);
  const [translationResult, setTranslationResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Web Speech API 관련 상태
  const [recognition, setRecognition] = useState(null);

    // Web Speech API 초기화
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'ko-KR'; // 한국어 설정
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranslationResult('음성 인식 중... 말씀해 주세요.');
      };
      
             recognitionInstance.onresult = (event) => {
         const transcript = event.results[0][0].transcript;
         setTranslationResult(transcript);
         setIsListening(false);
         setIsProcessing(false);
         // 음성 인식 완료 후 자동으로 중지
         recognitionInstance.stop();
       };
      
      recognitionInstance.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        if (event.error === 'not-allowed') {
          setTranslationResult('마이크 접근이 거부되었습니다. 브라우저에서 마이크 권한을 허용해주세요.');
        } else if (event.error === 'no-speech') {
          setTranslationResult('음성이 감지되지 않았습니다. 다시 시도해주세요.');
        } else {
          setTranslationResult(`음성 인식 오류: ${event.error}`);
        }
        setIsListening(false);
        setIsProcessing(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setTranslationResult('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  }, []);

  // 음성 인식 시작
  const startRecording = () => {
    if (recognition) {
      // 이전 결과 초기화
      setTranslationResult('');
      setIsProcessing(true);
      recognition.start();
    }
  };

  // 음성 인식 중지
  const stopRecording = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      setIsProcessing(false);
      setTranslationResult('음성 인식이 중지되었습니다.');
    }
  };

     

  const handleVoiceInput = () => {
    if (!isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleVoiceOutput = () => {
    if (translationResult && !isProcessing) {
      setIsSpeaking(true);
      
      // 실제 TTS API를 여기에 연결할 수 있습니다
      // 현재는 시뮬레이션으로 2초 후 완료
      setTimeout(() => {
        setIsSpeaking(false);
        // 여기에 실제 음성 출력 로직 추가
        console.log('음성 출력:', translationResult);
      }, 2000);
    }
  };

  return (
    <div className="ai-translation-container">
      <Topnav />
      
      <div className="ai-translation-content">
        <div className="ai-translation-header">
          <h1 className="ai-translation-title">AI Translation</h1>
          <p className="ai-translation-subtitle">한국어 음성을 실시간으로 번역해보세요</p>
        </div>

        <div className="translation-main">
          {/* 마스코트 캐릭터 */}
          <div className="mascot-character">
            <div className="mascot-avatar">
              <div className="mascot-face">
                <div className="mascot-eyes">
                  <div className="eye left-eye"></div>
                  <div className="eye right-eye"></div>
                </div>
                <div className="mascot-nose"></div>
                <div className="mascot-smile"></div>
              </div>
              <div className="mascot-body">
                <div className="mascot-shirt"></div>
                <div className="mascot-arms">
                  <div className="mascot-arm left-arm">
                    <button 
                      className={`microphone-holder ${isListening ? 'listening' : ''}`}
                      onClick={handleVoiceInput}
                      aria-label="음성 입력 시작/중지"
                    >
                      <div className="microphone-icon">🎤</div>
                      {isListening && <div className="listening-indicator"></div>}
                    </button>
                  </div>
                  <div className="mascot-arm right-arm">
                    <button 
                      className={`speaker-holder ${isSpeaking ? 'speaking' : ''}`}
                      onClick={handleVoiceOutput}
                      disabled={!translationResult || isProcessing}
                      aria-label="음성으로 출력"
                    >
                      <div className="speaker-icon">🔊</div>
                      {isSpeaking && <div className="speaking-indicator"></div>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 환영 메시지 */}
          <div className="welcome-message">
            <h2 className="greeting">Hi, {userName}!</h2>
            <p className="sub-greeting">마이크로 말하고, 스피커로 들어보세요!</p>
          </div>

                     {/* 번역 결과 표시 영역 */}
           <div className="translation-results">
             <div className="result-card">
               <h3>번역 결과</h3>
               <div className="result-content">
                 {translationResult ? (
                   <p className={`result-text ${isProcessing ? 'processing' : ''}`}>
                     {translationResult}
                   </p>
                 ) : (
                   <p className="placeholder-text">마스코트의 마이크를 눌러서 음성 인식을 시작하세요</p>
                 )}
                 
                 {/* 마이크 권한 문제 시 해결 방법 안내 */}
                 {translationResult && translationResult.includes('마이크 접근') && (
                   <div className="permission-help">
                     <button 
                       className="permission-btn"
                       onClick={() => window.location.reload()}
                       style={{
                         marginTop: '15px',
                         padding: '8px 16px',
                         backgroundColor: '#FFD700',
                         color: '#000',
                         border: 'none',
                         borderRadius: '6px',
                         cursor: 'pointer',
                         fontSize: '14px'
                       }}
                     >
                       🔄 페이지 새로고침
                     </button>
                     <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                       마이크 권한을 허용한 후 이 버튼을 클릭하세요
                     </p>
                   </div>
                 )}
               </div>
              
                             {/* 상태 표시 */}
               {isListening && (
                 <div className="status-indicator">
                   <p className="status-text">🎤 음성 인식 중... 마이크 버튼을 다시 눌러서 중지하세요!</p>
                 </div>
               )}
              
              {isSpeaking && (
                <div className="status-indicator">
                  <p className="status-text">🔊 음성 출력 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITranslation;

