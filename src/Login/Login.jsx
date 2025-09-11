import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topnav from '../components/Topnav';
import './Login.css';

// 백엔드 API URL 설정
const API_BASE_URL = 'https://re-local.onrender.com';

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const canSubmit = id.trim() && password && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      userid: id.trim(),
      password,
    };

    try {
      setLoading(true);
      setErrMsg('');
      
      // 백엔드로 로그인 데이터 전송
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      });
      
      console.log('로그인 성공:', res.data);
      
      // 토큰이 있다면 localStorage에 저장
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // 사용자 정보가 있다면 저장
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      alert('로그인이 완료되었습니다!');
      navigate('/'); // 메인 페이지로 이동
    } catch (err) {
      console.error('로그인 오류:', err);
      
      // 더 자세한 오류 메시지 표시
      if (err.response) {
        // 서버에서 응답이 왔지만 오류인 경우
        setErrMsg(err.response.data?.message || `로그인 실패: ${err.response.status}`);
      } else if (err.request) {
        // 서버에 요청이 전송되지 않은 경우 (연결 문제)
        setErrMsg('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else {
        // 기타 오류
        setErrMsg('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Topnav />
      
      <div className="login-form-container">
        <div className="login-header">
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">FestiGuard 계정으로 로그인하세요</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          {errMsg && (
            <div className="login-error-message">
              {errMsg}
            </div>
          )}
          
          <div className="login-form-group">
            <label htmlFor="userid" className="login-form-label">아이디</label>
            <input
              id="userid"
              type="text"
              className="login-form-input"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
            />
          </div>
          
          <div className="login-form-group">
            <label htmlFor="userpassword" className="login-form-label">비밀번호</label>
            <input
              id="userpassword"
              type="password"
              className="login-form-input"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={!canSubmit}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="login-signup-link">
          <p className="login-signup-text">계정이 없으신가요?</p>
          <button 
            type="button" 
            className="login-signup-btn"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
