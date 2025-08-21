import React, { useState } from 'react';
import Topnav from '../components/Topnav';
import './Login.css';

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert(`아이디: ${id}\n비밀번호: ${password}`);
  };

  return (
    <div className="login-container">
      <Topnav />
      
      <div className="login-form-container">
        <div className="login-header">
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">KurtainCall 계정으로 로그인하세요</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="userid" className="form-label">아이디</label>
          <input
            id="userid"
            type="text"
            className="form-input"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="userpassword" className="form-label">비밀번호</label>
          <input
            id="userpassword"
            type="password"
            className="form-input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button onClick={handleLogin} className="login-btn">
          로그인
        </button>
        
        <div className="signup-link">
          <p className="signup-text">계정이 없으신가요?</p>
          <button 
            type="button" 
            className="signup-btn"
            onClick={() => window.location.href = '/signup'}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
