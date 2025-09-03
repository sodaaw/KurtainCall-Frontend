// src/services/http.js
import axios from 'axios';

// Vite(.env: VITE_API_BASE) 또는 CRA(.env: REACT_APP_API_BASE) 지원
const baseURL =
  process.env.REACT_APP_API_BASE ||
  process.env.VITE_API_BASE ||
  'https://re-local.onrender.com/api';

export const http = axios.create({
  baseURL,
  withCredentials: false,       // 인증 쿠키가 필요하면 true로 바꿔 사용
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 필요 시 인터셉터(로그/에러 공통 처리) 추가 가능
// http.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     console.error('API error:', err?.response?.status, err?.message);
//     return Promise.reject(err);
//   }
// );
