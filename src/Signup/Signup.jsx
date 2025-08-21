import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topnav from '../components/Topnav';
import './Signup.css';

// 백엔드 API URL 설정
const API_BASE_URL = 'https://re-local.onrender.com';

const COUNTRIES = ['Korea','USA','Japan','China','Germany','France','Canada','UK','Spain','Australia'];
const LANGUAGES = ['Korean','English','Japanese','Chinese','German','French','Spanish','Portuguese','Russian','Arabic'];

// 태그 10개
const TAGS = [
  'K-pop','Street Food','Museum','Hanok','Hiking',
  'Night Market','Cafe Tour','Theater','Festival','History'
];

export default function Signup() {
  // 직접 입력
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');      // "0" | "1"
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  // 토글
  const [country, setCountry] = useState('Korea');
  const [language, setLanguage] = useState('Korean');

  // ✅ 태그(다중 선택) — 타입 주석 제거
  const [selectedTags, setSelectedTags] = useState([]);

  // UX
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  // 타입 주석 제거
  const isInt = (v) => /^\d+$/.test(String(v));
  const isValidGender = gender === '0' || gender === '1';

  const canSubmit =
    name.trim() &&
    userid.trim() &&
    password &&
    isValidGender &&
    isInt(age) &&
    country &&
    language &&
    selectedTags.length > 0 &&
    !loading;

  // ✅ 태그 토글 핸들러 — 타입 주석 제거
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      gender: Number(gender),
      userid: userid.trim(),
      password,
      country,
      language,
      age: parseInt(age, 10),
      interestTag: selectedTags.map(tag => `#${tag}`).join(','),   // #tag1,#tag2 형태로 전송
    };

    try {
      setLoading(true);
      setErrMsg('');
      
      // 백엔드로 회원가입 데이터 전송
      const res = await axios.post(`${API_BASE_URL}/api/users/signup`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      });
      
      console.log('서버 응답:', res.data);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      console.error('회원가입 오류:', err);
      
      // 더 자세한 오류 메시지 표시
      if (err.response) {
        // 서버에서 응답이 왔지만 오류인 경우
        setErrMsg(err.response.data?.message || `서버 오류: ${err.response.status}`);
      } else if (err.request) {
        // 서버에 요청이 전송되지 않은 경우 (연결 문제)
        setErrMsg('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else {
        // 기타 오류
        setErrMsg('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Topnav />
      
      <div className="signup-form-container">
        <div className="signup-header">
          <h1 className="signup-title">회원가입</h1>
          <p className="signup-subtitle">KurtainCall 계정을 만들어보세요</p>
        </div>

        <form className="signup-form" onSubmit={onSubmit}>
          {errMsg && (
            <div className="error-message">
              {errMsg}
            </div>
          )}

          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">이름</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="userid" className="form-label">아이디</label>
            <input
              id="userid"
              type="text"
              className="form-input"
              placeholder="아이디를 입력하세요"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* 성별: 0/1 */}
          <div className="form-group">
            <label htmlFor="gender" className="form-label">성별 (남자: 0, 여자: 1)</label>
            <input
              id="gender"
              type="number"
              className="form-input"
              placeholder="예: 0 또는 1"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              min="0"
              max="1"
            />
          </div>

          {/* 국가 토글 */}
          <div className="form-group">
            <span className="form-label">국가</span>
            <div className="toggle-group">
              {COUNTRIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`toggle ${country === c ? 'active' : ''}`}
                  onClick={() => setCountry(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 언어 토글 */}
          <div className="form-group">
            <span className="form-label">언어</span>
            <div className="toggle-group">
              {LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l}
                  className={`toggle ${language === l ? 'active' : ''}`}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 나이 */}
          <div className="form-group">
            <label htmlFor="age" className="form-label">나이</label>
            <input
              id="age"
              type="number"
              className="form-input"
              placeholder="예: 23"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
            />
          </div>

          {/* 관심 태그(다중선택) */}
          <div className="form-group">
            <span className="form-label">관심 태그 (복수 선택)</span>
            <div className="chip-group">
              {TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  className={`chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button className="signup-btn" type="submit" disabled={!canSubmit}>
            {loading ? '처리 중…' : '회원가입'}
          </button>
        </form>
        
        <div className="login-link">
          <p className="login-text">이미 계정이 있으신가요?</p>
          <button 
            type="button" 
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
