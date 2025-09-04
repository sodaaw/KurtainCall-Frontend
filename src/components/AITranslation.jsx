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
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS 활성화 (realtime에서는 '텍스트도 같이 출력' 토글로 사용)
  const [intermediateResults, setIntermediateResults] = useState({}); // 중간 결과들
  
  // 백엔드 연동 상태
  const [audioChunks, setAudioChunks] = useState([]); // 오디오 청크 배열 추가
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  

  // From 언어가 변경될 때 To 언어를 자동으로 반대 언어로 설정
  React.useEffect(() => {
    if (fromLanguage === 'ko') {
      setToLanguage('en');
    } else if (fromLanguage === 'en') {
      setToLanguage('ko');
    }
  }, [fromLanguage]);

  // 컴포넌트 언마운트 시 오디오 정리
  React.useEffect(() => {
    return () => {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
    };
  }, []);

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

     // 음성 입력 처리 (바로통역 모드만)
   const handleVoiceInput = () => {
     if (selectedMode === 'realtime') {
       // 실시간 모드: MediaRecorder 사용
       if (!isRecording) {
         startRecording();
       } else {
         stopRecording();
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
      
      // 2. STS(오디오)와 STT(텍스트) 병렬 요청
      const sttPromise = ttsEnabled
        ? getSTTText(filename).catch((e) => {
            // 서버가 STT 텍스트 엔드포인트를 제공하지 않을 수 있으므로 조용히 폴백
            console.info('[info] STT 텍스트 엔드포인트 미지원 또는 404. 텍스트 출력 생략.', e?.message || e);
            return '';
          })
        : Promise.resolve('');

      const [translatedAudioBlob, sttText] = await Promise.all([
        getSTSResult(filename), // 오디오(항상 재생)
        sttPromise
      ]);

      // 3. 텍스트가 있으면 TT(텍스트 번역) 수행 및 화면 표시
      if (sttText && ttsEnabled) {
        setIntermediateResults(prev => ({ ...prev, stt: `음성 인식 텍스트: ${sttText}` }));
        const finalTranslatedText = await performTranslation(sttText, fromLanguage, toLanguage);
        setIntermediateResults(prev => ({ ...prev, translation: finalTranslatedText }));
        setTranslationResult(finalTranslatedText);
      } else {
        setTranslationResult('실시간 통역이 완료되었습니다.');
      }
      
      // 4. 받은 번역된 음성 파일 재생 (항상 재생)
      if (translatedAudioBlob) {
        await playAudioResult(translatedAudioBlob);
      }

      setIntermediateResults(prev => ({ 
        ...prev, 
        stt: sttText ? '음성 인식 완료' : '음성 인식(텍스트 표시) 생략',
        tts: '음성 합성(재생) 완료'
      }));
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

  // ✅ 추가: STT 텍스트(인식 결과) 가져오기 (가능한 엔드포인트들을 순차 시도, 전부 실패해도 에러 던지지 않음)
  const getSTTText = async (filename) => {
    // 1) /stt (권장)
    try {
      const r = await fetch(
        `${API_BASE}/api/transcribe/stt?filename=${encodeURIComponent(filename)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        const text = j.text || j.transcript || j.recognizedText || '';
        if (text) return text;
      } else {
        // 404 등일 때는 조용히 폴백
        console.info('[info] /stt not available:', r.status);
      }
    } catch (e) {
      console.info('[info] /stt request failed, fallback to /sts json', e?.message || e);
    }

    // 2) /sts 를 JSON으로 시도(서버가 텍스트도 줄 수 있는 경우)
    try {
      const r2 = await fetch(
        `${API_BASE}/api/transcribe/sts?filename=${encodeURIComponent(filename)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (r2.ok) {
        const j2 = await r2.json().catch(() => ({}));
        const text = j2.text || j2.sourceText || j2.stt || j2.recognizedText || '';
        if (text) return text;
      } else {
        console.info('[info] /sts json not available:', r2.status);
      }
    } catch (e) {
      console.info('[info] /sts json request failed', e?.message || e);
    }

    // 모든 시도가 실패하면 빈 문자열 반환(에러 미발생)
    return '';
  };
  

  // 받은 mp3 파일 재생
  const playAudioResult = async (audioBlob) => {
    try {
      // 이전에 재생 중인 오디오가 있다면 중지
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
      
      // Blob을 오디오 URL로 변환
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // 전역 변수에 현재 재생 중인 오디오 저장
      window.currentAudio = audio;

      setIsSpeaking(true);
      
      // 오디오 재생
      await audio.play();
      console.log('번역된 음성 재생 시작');
      
      // 재생 완료 후 정리
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        window.currentAudio = null;
        console.log('번역된 음성 재생 완료');
      };
      
      // 오류 발생 시 정리
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        window.currentAudio = null;
        console.error('오디오 재생 중 오류 발생');
      };
      
    } catch (error) {
      setIsSpeaking(false);
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

  



  // 번역 API 호출 (백엔드 연동)
  const performTranslation = async (text, from, to) => {
    try {
      const res = await fetch(`${API_BASE}/api/transcribe/tt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang: to,
        }),
      });
  
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`번역 실패: ${res.status} ${errBody}`);
      }
  
      const result = await res.json().catch(async () => {
        // 혹시 서버가 JSON이 아닌 걸 보냈을 때 대비
        const fallbackText = await res.text().catch(() => '');
        return { translated: fallbackText };
      });
  
      // 응답 키 호환 처리
      const out =
        result.translated ?? result.translatedText ?? result.text ?? '';
  
      return out || '번역 결과를 받지 못했습니다.';
    } catch (err) {
      console.error('번역 API 오류:', err);
      throw err; // 상위 handleTextTranslation에서 메시지 표출
    }
  };
  

      

  // TTS API 호출 (백엔드 연동)
  const performTTS = async (text, language) => {
    try {
      // 백엔드 TTS API 호출
      const response = await fetch(`${API_BASE}/api/transcribe/tts`, {
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
      
      // 백엔드에서 오디오 파일 받아서 재생
      const audioBlob = await response.blob();
      await playAudioResult(audioBlob);
      
    } catch (error) {
      console.error('TTS API 오류:', error);
      // 폴백: 브라우저 내장 TTS 사용
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
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
              <option value="realtime">🗣️ 바로통역</option>
              <option value="text">🔤 텍스트 번역</option>
            </select>
          </div>

          {/* 언어 선택 */}
          <div className="language-selection">
            <div className="language-pair">
              <div className="language-input">
                <label>From:</label>
                <select value={fromLanguage} onChange={(e) => setFromLanguage(e.target.value)}>
                  <option value="ko">KR</option>
                  <option value="en">ENG</option>
                </select>
              </div>
              <div className="language-arrow">→</div>
              <div className="language-output">
                <label>To:</label>
                <select value={toLanguage} onChange={(e) => setToLanguage(e.target.value)}>
                  <option value="en">ENG</option>
                  <option value="ko">KR</option>
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
              {selectedMode === 'text' ? '🔊 음성도 같이 출력' : '📝 텍스트도 같이 출력'}
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
                  placeholder="번역할 텍스트를 입력하세요 (음성 없이 텍스트만 번역)"
                  className="text-input"
                  rows="4"
                />
                <button 
                  onClick={handleTextTranslation}
                  className="translate-btn"
                  disabled={!inputText.trim() || isProcessing}
                >
                  텍스트 번역하기
                </button>
              </div>
            )}

            {/* 음성 입력 영역 - 바로통역 모드에서만 표시 */}
            {selectedMode === 'realtime' && (
              <div className="voice-input-area">
                <div className="voice-input-header">
                  <h4>🎤 음성 인식</h4>
                  <p className="voice-input-description">
                    마이크를 눌러서 말씀하시면 실시간으로 번역됩니다
                  </p>
                </div>
                
                <button 
                  className={`microphone-btn ${isListening ? (isRecording ? 'recording' : 'listening') : ''}`}
                  onClick={handleVoiceInput}
                  disabled={isProcessing}
                >
                  {isRecording ? '🔴 녹음 중...' : '🎤 녹음 시작'}
                </button>
            
                {isListening && (
                  <div className="listening-status">
                    <div className="listening-animation">
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                    </div>
                    <p>
                      녹음 중입니다. 다시 눌러서 중지하세요...
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
              
              
              
              {/* 최종 결과 */}
              <div className="final-result">
                <h4>
                  {selectedMode === 'realtime' && '🔄 실시간 통역 결과'}
                  {selectedMode === 'text' && '🌐 번역 결과'}
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
                    </p>
                  )}
                </div>
              </div>
              
              {/* 상태 표시 */}
              {isListening && (
                <div className="status-indicator">
                  <p className="status-text">
                    🎤 녹음 중입니다. 마이크 버튼을 다시 눌러서 중지하세요!
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
