import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import './Login.css';

export default function Login() {
  const [deviceNumber, setDeviceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const canSubmit = deviceNumber.trim() && !loading;

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      setErrMsg('');
      setSuccessMsg('');
      
      // 기기번호 검증 (시연용 - 12345만 허용)
      if (deviceNumber.trim() !== '12345') {
        throw new Error('올바르지 않은 기기번호입니다. 올바른 기기번호를 입력해주세요.');
      }

      // 기기번호 저장
      localStorage.setItem('deviceId', deviceNumber.trim());
      
      // 성공 메시지 표시
      setSuccessMsg('기기번호가 성공적으로 등록되었습니다! 메인 페이지로 이동합니다...');
      setErrMsg('');
      
      // 메인 페이지로 이동
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('기기번호 등록 오류:', err);
      setErrMsg(err.message || '기기번호 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Topnav />
      
      <div className="login-form-container">
        <div className="login-header">
          <h1 className="login-title">기기번호 입력</h1>
          <p className="login-subtitle">부여받은 기기번호 5자리를 입력해주세요</p>
        </div>
        
        <form className="login-form" onSubmit={handleDeviceSubmit}>
          {errMsg && (
            <div className="login-error-message">
              {errMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="login-success-message">
              {successMsg}
            </div>
          )}
          
          <div className="login-form-group">
            <label htmlFor="deviceNumber" className="login-form-label">기기번호</label>
            <input
              id="deviceNumber"
              type="text"
              className="login-form-input"
              placeholder="12345"
              value={deviceNumber}
              onChange={(e) => setDeviceNumber(e.target.value)}
              maxLength={5}
              autoComplete="off"
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={!canSubmit}>
            {loading ? '등록 중...' : '기기번호 등록'}
          </button>
        </form>
        
        <div className="login-signup-link">
          <p className="login-signup-text">기기번호를 잊으셨나요?</p>
          <p className="login-signup-help">관리자에게 문의하시거나 기기번호를 다시 확인해주세요.</p>
        </div>
      </div>
    </div>
  );
}
