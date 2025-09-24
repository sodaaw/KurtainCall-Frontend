import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'https://re-local.onrender.com/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: 백엔드 서버에 연결할 수 없습니다.');
      console.error('서버가 실행 중인지 확인하세요:', API_BASE_URL);
    } else if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 연극 정보 API
export const playAPI = {
  // 연극 목록 조회 (메인페이지 포스터용)
  getPlays: async () => {
    try {
      const { data } = await apiClient.get('/play');
      // ▶ 서버가 { items: [...] }를 주므로 배열로 변환
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      return arr;
    } catch (error) {
      console.error('Failed to fetch plays:', error);
      
      // 네트워크 에러인 경우 더 자세한 정보 제공
      if (error.code === 'ERR_NETWORK') {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      throw error;
    }
  },

  // 카테고리별 연극 조회
  getPlaysByCategory: async (category) => {
    try {
      const { data } = await apiClient.get('/play');
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      return arr; // 현재는 전체 반환
    } catch (error) {
      console.error(`Failed to fetch plays for category ${category}:`, error);
      throw error;
    }
  },
};

// 센서 데이터 API
export const sensorAPI = {
  // 모든 센서 데이터 조회
  getAllSensorData: async () => {
    try {
      const { data } = await apiClient.get('/sensor');
      return data;
    } catch (error) {
      console.error('Failed to fetch all sensor data:', error);
      throw error;
    }
  },

  // 특정 기기번호의 센서 데이터 조회
  getSensorDataById: async (deviceId) => {
    try {
      const { data } = await apiClient.get(`/sensor/${deviceId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch sensor data for device ${deviceId}:`, error);
      throw error;
    }
  },

  // 모든 센서 분석 결과 조회
  getAllSensorResults: async () => {
    try {
      const { data } = await apiClient.get('/sensor-result');
      return data;
    } catch (error) {
      console.error('Failed to fetch all sensor results:', error);
      throw error;
    }
  },

  // 특정 기기번호의 센서 분석 결과 조회
  getSensorResultById: async (deviceId) => {
    try {
      console.log(`🌐 API 호출: GET /sensor-result/${deviceId}`);
      const { data } = await apiClient.get(`/sensor-result/${deviceId}`);
      console.log(`📡 API 응답 성공 (${deviceId}):`, data);
      return data;
    } catch (error) {
      console.error(`❌ API 호출 실패 (${deviceId}):`, error);
      console.error(`🔍 에러 상세:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // 센서 분석 결과 전송 (데이터분석 시스템에서 호출)
  sendSensorResult: async (resultData) => {
    try {
      const { data } = await apiClient.post('/sensor-result', resultData);
      return data;
    } catch (error) {
      console.error('Failed to send sensor result:', error);
      throw error;
    }
  },
};

export default apiClient;
