import React, { useState, useEffect } from 'react';
import Topnav from './Topnav';
import './AITranslation.css';
const API_BASE = 'https://re-local.onrender.com';
  
const AITranslation = () => {

  const [isListening, setIsListening] = useState(false);
  const [translationResult, setTranslationResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // 다국어 통역 시스템 상태
  const [selectedMode, setSelectedMode] = useState('realtime'); // 모드 선택
  const [inputText, setInputText] = useState(''); // 텍스트 입력
  const [fromLanguage, setFromLanguage] = useState('ko'); // 출발 언어
  const [toLanguage, setToLanguage] = useState('en'); // 도착 언어
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS 활성화
  const [intermediateResults, setIntermediateResults] = useState({}); // 중간 결과들
  
  // 백엔드 연동 상태
  const [audioChunks, setAudioChunks] = useState([]); // 오디오 청크 배열 추가
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Web Speech API 관련 상태
  const [recognition, setRecognition] = useState(null);

    // MediaRecorder 초기화 (백엔드 연동용)
  React.useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        // 녹음 데이터를 주기적으로 수집 (1초마다)
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            // 청크를 배열에 누적
            setAudioChunks(prev => [...prev, event.data]);
          }
        };
        
        recorder.onstop = () => {
          // 녹음이 완료되면 모든 청크를 합쳐서 하나의 Blob 생성
          setAudioChunks(prev => {
            if (prev.length > 0 && selectedMode === 'realtime') {
              const finalBlob = new Blob(prev, { type: 'audio/webm;codecs=opus' });
              console.log('최종 오디오 Blob 생성:', finalBlob.type, finalBlob.size, 'bytes');
              
              // 직접 함수 호출 (state 업데이트 대기하지 않음)
              handleRealtimeTranslationWithBackend(finalBlob);
              
              return []; // 청크 배열 초기화
            }
            return prev;
          });
        };
        
        setMediaRecorder(recorder);
      } catch (error) {
        console.error('마이크 접근 오류:', error);
        setTranslationResult('마이크 접근이 거부되었습니다. 브라우저에서 마이크 권한을 허용해주세요.');
      }
    };
    
    initializeMediaRecorder();
  }, [selectedMode]);
  
  // Web Speech API 초기화 (기존 STT용)
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
        setIsListening(false);
        setIsProcessing(false);
        
        // 선택된 모드에 따라 처리
        switch (selectedMode) {
          case 'realtime':
            // 실시간 모드에서는 MediaRecorder 사용
            break;
          case 'stt':
            handleSTTOnly(transcript);
            break;
          default:
            setTranslationResult(transcript);
        }
        
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
  }, [selectedMode]);

    // 음성 녹음 시작 (백엔드 연동용)
  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      // 이전 결과 초기화
      setTranslationResult('');
      setIntermediateResults({});
      setAudioChunks([]); // 청크 배열 초기화
      setIsRecording(true);
      setIsListening(true);
      
      // 녹음 시작 (1초마다 데이터 수집)
      mediaRecorder.start(1000);
      console.log('녹음 시작 - 지속 녹음 모드');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsListening(false);
      console.log('녹음 중지');
    }
  };

  // 음성 입력 처리 (모드별로 다르게)
  const handleVoiceInput = () => {
    if (selectedMode === 'realtime') {
      // 실시간 모드: MediaRecorder 사용
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    } else {
      // STT 모드: Web Speech API 사용
      if (!isListening) {
        if (recognition) {
          setTranslationResult('');
          setIsProcessing(true);
          recognition.start();
        }
      } else {
        if (recognition) {
          recognition.stop();
          setIsListening(false);
          setIsProcessing(false);
        }
      }
    }
  };

  // 백엔드 연동 함수들 - 정확한 흐름으로 수정
  const handleRealtimeTranslationWithBackend = async (audioBlob) => {
    if (!audioBlob) {
      console.error('audioBlob이 없습니다!');
      return;
    }
    
    console.log('백엔드 연동 시작:', audioBlob.type, audioBlob.size, 'bytes');
    
    setIsProcessing(true);
    setIntermediateResults(prev => ({ ...prev, stt: '음성 파일 처리 중...' }));
    
    try {
      // 1. 녹음된 webm 파일을 백엔드로 업로드 (POST)
      const filename = await uploadAudioToBackend(audioBlob);
      setIntermediateResults(prev => ({ ...prev, stt: `음성 파일 업로드 완료: ${filename}` }));
      
      // 2. 서버가 돌려준 filename으로 번역된 음성 파일 요청 (GET)
      const translatedAudioBlob = await getSTSResult(filename);
      setIntermediateResults(prev => ({ 
        ...prev, 
        stt: '음성 인식 완료',
        translation: '번역 완료',
        tts: '음성 합성 완료'
      }));
      
      // 3. 받은 번역된 음성 파일 재생
      if (ttsEnabled && translatedAudioBlob) {
        await playAudioResult(translatedAudioBlob);
      }
      
      setTranslationResult('실시간 통역이 완료되었습니다. 번역된 음성을 재생합니다.');
    } catch (error) {
      console.error('백엔드 연동 실시간 통역 오류:', error);
      setTranslationResult('백엔드 연동 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
  
    const res = await fetch(`${API_BASE}/api/transcribe/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`업로드 실패: ${res.status}`);
  
    const json = await res.json();
    console.log('업로드 성공, 서버 응답:', json); // { filename, mimetype, size ... }
    return json.filename;
  };
  

  // 백엔드에서 번역된 음성 파일 받아오기 (GET)
  const getSTSResult = async (filename) => {
    const res = await fetch(
      `${API_BASE}/api/transcribe/sts?filename=${encodeURIComponent(filename)}`,
      { headers: { Accept: 'audio/mpeg' } }
    );
    if (!res.ok) throw new Error(`번역된 음성 파일 요청 실패: ${res.status}`);
    return await res.blob(); // mp3 Blob
  };
  

  // 받은 mp3 파일 재생
  const playAudioResult = async (audioBlob) => {
    try {
      // Blob을 오디오 URL로 변환
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // 오디오 재생
      await audio.play();
      console.log('번역된 음성 재생 시작');
      
      // 재생 완료 후 URL 해제
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('번역된 음성 재생 완료');
      };
      
    } catch (error) {
      console.error('오디오 재생 오류:', error);
      throw error;
    }
  };

  const handleTextTranslation = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      const translatedText = await performTranslation(inputText, fromLanguage, toLanguage);
      setTranslationResult(translatedText);
      
      if (ttsEnabled) {
        await performTTS(translatedText, toLanguage);
      }
    } catch (error) {
      console.error('텍스트 번역 오류:', error);
      setTranslationResult('번역 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSTTOnly = async (speechText) => {
    setIntermediateResults(prev => ({ ...prev, stt: speechText }));
    setTranslationResult(speechText);
  };

  const handleTTSOnly = async () => {
    if (!inputText.trim()) return;
    
    setIsSpeaking(true);
    try {
      await performTTS(inputText, fromLanguage);
    } catch (error) {
      console.error('TTS 오류:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // 번역 API 호출 (백엔드 연동)
  const performTranslation = async (text, from, to) => {
    try {
      // 실제 백엔드 번역 API 호출 (실제 구현 시 아래 주석 해제)
      /*
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          from: from,
          to: to
        })
      });
      
      if (!response.ok) {
        throw new Error(`번역 실패: ${response.status}`);
      }
      
      const result = await response.json();
      return result.translatedText;
      */
      
      // 시뮬레이션: 실제 번역 처리 시간을 고려한 지연
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 간단한 번역 시뮬레이션
      if (from === 'ko' && to === 'en') {
        return `[${from}→${to}] Hello, this is a test voice.`;
      } else if (from === 'en' && to === 'ko') {
        return `[${from}→${to}] 안녕하세요, 이것은 테스트 음성입니다.`;
      } else {
        return `[${from}→${to}] ${text}`;
      }
    } catch (error) {
      console.error('번역 API 오류:', error);
      throw error;
    }
  };

  // TTS API 호출 (백엔드 연동)
  const performTTS = async (text, language) => {
    try {
      // 실제 백엔드 TTS API 호출 (실제 구현 시 아래 주석 해제)
      /*
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: language
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS 실패: ${response.status}`);
      }
      
      const result = await response.json();
      // TTS 오디오 재생 로직
      const audio = new Audio(result.audioUrl);
      await audio.play();
      */
      
      // 시뮬레이션: 실제 TTS 처리 시간을 고려한 지연
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('TTS 출력 완료:', text, '언어:', language);
      
      // 브라우저 내장 TTS 사용 (실제 TTS API가 없을 때)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS API 오류:', error);
      throw error;
    }
  };


  return (
    <div className="ai-translation-container">
      <Topnav />
      
      <div className="ai-translation-content">
        <div className="ai-translation-header">
          <h1 className="ai-translation-title">AI 다국어 통역 시스템</h1>
          <p className="ai-translation-subtitle">STT, 번역, TTS를 통합한 완벽한 통역 경험</p>
        </div>

        <div className="translation-main">
          {/* 모드 선택 드롭다운 */}
          <div className="mode-selection">
            <h3>통역 모드 선택</h3>
            <select 
              value={selectedMode} 
              onChange={(e) => setSelectedMode(e.target.value)}
              className="mode-dropdown"
            >
              <option value="realtime">🗣️ 바로 통역 (실시간 STS)</option>
              <option value="text">🔤 텍스트 번역</option>
              <option value="stt">🗣️ 음성 → 텍스트 (STT)</option>
              <option value="tts">🔊 텍스트 → 음성 출력 (TTS)</option>
              <option value="text-tts">🌐 텍스트로 통역 (Text → 번역 → TTS)</option>
            </select>
          </div>

          {/* 언어 선택 */}
          <div className="language-selection">
            <div className="language-pair">
              <div className="language-input">
                <label>From:</label>
                <select value={fromLanguage} onChange={(e) => setFromLanguage(e.target.value)}>
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="language-arrow">→</div>
              <div className="language-output">
                <label>To:</label>
                <select value={toLanguage} onChange={(e) => setToLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* TTS 토글 */}
          <div className="tts-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={ttsEnabled} 
                onChange={(e) => setTtsEnabled(e.target.checked)}
              />
              🔊 음성 출력 활성화
            </label>
          </div>

          {/* 입력 영역 */}
          <div className="input-section">
            {/* 텍스트 입력 영역 - 바로통역 모드가 아닐 때만 표시 */}
            {selectedMode !== 'realtime' && selectedMode !== 'stt' && (
              <div className="text-input-area">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={selectedMode === 'text' ? "번역할 텍스트를 입력하세요 (음성 없이 텍스트만 번역)" : "번역할 텍스트를 입력하세요..."}
                  className="text-input"
                  rows="4"
                />
                {(selectedMode === 'text' || selectedMode === 'text-tts') && (
                  <button 
                    onClick={handleTextTranslation}
                    className="translate-btn"
                    disabled={!inputText.trim() || isProcessing}
                  >
                    {selectedMode === 'text' ? '텍스트 번역하기' : '번역하기'}
                  </button>
                )}
                {selectedMode === 'tts' && (
                  <button 
                    onClick={handleTTSOnly}
                    className="tts-btn"
                    disabled={!inputText.trim() || isSpeaking}
                  >
                    음성 출력
                  </button>
                )}
              </div>
            )}

            {/* 음성 입력 영역 - 바로통역과 STT 모드에서 표시 */}
            {(selectedMode === 'realtime' || selectedMode === 'stt') && (
              <div className="voice-input-area">
                <div className="voice-input-header">
                  <h4>🎤 음성 인식</h4>
                  <p className="voice-input-description">
                    {selectedMode === 'realtime' 
                      ? '마이크를 눌러서 말씀하시면 실시간으로 번역됩니다' 
                      : '마이크를 눌러서 음성을 텍스트로 변환하세요'
                    }
                  </p>
                </div>
                
                                 <button 
                   className={`microphone-btn ${isListening ? (isRecording ? 'recording' : 'listening') : ''}`}
                   onClick={handleVoiceInput}
                   disabled={isProcessing}
                 >
                   {selectedMode === 'realtime' 
                     ? (isRecording ? '🔴 녹음 중...' : '🎤 녹음 시작')
                     : (isListening ? '🔴 음성 인식 중...' : '🎤 음성 입력 시작')
                   }
                 </button>
                 
                 {isListening && (
                   <div className="listening-status">
                     <div className="listening-animation">
                       <div className="wave"></div>
                       <div className="wave"></div>
                       <div className="wave"></div>
                     </div>
                     <p>
                       {selectedMode === 'realtime' 
                         ? '녹음 중입니다. 다시 눌러서 중지하세요...' 
                         : '말씀해 주세요...'
                       }
                     </p>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* 결과 표시 영역 */}
          <div className="translation-results">
            <div className="result-card">
              <h3>통역 결과</h3>
              
              {/* 중간 결과들 표시 (실시간 통역 모드) */}
              {selectedMode === 'realtime' && Object.keys(intermediateResults).length > 0 && (
                <div className="intermediate-results">
                  <h4 className="intermediate-title">🔄 실시간 통역 과정</h4>
                  {intermediateResults.stt && (
                    <div className="result-step">
                      <span className="step-label">🎤 음성 인식:</span>
                      <p className="step-text">{intermediateResults.stt}</p>
                    </div>
                  )}
                  {intermediateResults.translation && (
                    <div className="result-step">
                      <span className="step-label">🌐 번역 결과:</span>
                      <p className="step-text">{intermediateResults.translation}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* STT 모드 결과 표시 */}
              {selectedMode === 'stt' && translationResult && (
                <div className="stt-results">
                  <h4 className="stt-title">🎤 음성 인식 결과</h4>
                  <div className="stt-content">
                    <p className="stt-text">{translationResult}</p>
                  </div>
                </div>
              )}
              
              {/* 최종 결과 */}
              <div className="final-result">
                <h4>
                  {selectedMode === 'realtime' && '🔄 실시간 통역 결과'}
                  {selectedMode === 'text' && '🌐 번역 결과'}
                  {selectedMode === 'stt' && '🎤 음성 인식 결과'}
                  {selectedMode === 'tts' && '🔊 음성 출력'}
                  {selectedMode === 'text-tts' && '🌐 통역 결과'}
                </h4>
                <div className="result-content">
                  {translationResult ? (
                    <p className={`result-text ${isProcessing ? 'processing' : ''}`}>
                      {translationResult}
                    </p>
                  ) : (
                    <p className="placeholder-text">
                      {selectedMode === 'realtime' && '🎤 마이크를 눌러서 실시간 통역을 시작하세요'}
                      {selectedMode === 'text' && '📝 텍스트를 입력하고 번역하기를 클릭하세요'}
                      {selectedMode === 'stt' && '🎤 마이크를 눌러서 음성을 텍스트로 변환하세요'}
                      {selectedMode === 'tts' && '🔊 텍스트를 입력하고 음성 출력을 클릭하세요'}
                      {selectedMode === 'text-tts' && '🌐 텍스트를 입력하고 번역 후 음성 출력하세요'}
                    </p>
                  )}
                </div>
              </div>
              
                             {/* 상태 표시 */}
               {isListening && (
                 <div className="status-indicator">
                   <p className="status-text">
                     {selectedMode === 'realtime' 
                       ? '🎤 녹음 중입니다. 마이크 버튼을 다시 눌러서 중지하세요!' 
                       : '🎤 음성 인식 중... 마이크 버튼을 다시 눌러서 중지하세요!'
                     }
                   </p>
                 </div>
               )}
              
              {isProcessing && (
                <div className="status-indicator">
                  <p className="status-text">⚙️ 처리 중...</p>
                </div>
              )}
              
              {isSpeaking && (
                <div className="status-indicator">
                  <p className="status-text">🔊 음성 출력 중...</p>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITranslation;