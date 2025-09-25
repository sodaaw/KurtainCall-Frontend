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
  // referrerPolicy 설정 추가
  withCredentials: false,
  // fetch API의 referrerPolicy와 유사한 설정
  transformRequest: [(data, headers) => {
    // referrerPolicy: 'no-referrer' 효과를 위해 Referer 헤더 제거
    delete headers['Referer'];
    return data;
  }],
});

// 요청 인터셉터 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API 요청 시작: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`📋 요청 헤더:`, config.headers);
    console.log(`📦 요청 데이터:`, config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 인증 토큰 추가됨`);
    }
    return config;
  },
  (error) => {
    console.error(`❌ 요청 인터셉터 에러:`, error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`);
    console.log(`📦 응답 데이터 크기:`, Array.isArray(response.data) ? `${response.data.length}개 항목` : '단일 객체');
    console.log(`📋 응답 헤더:`, response.headers);
    return response;
  },
  (error) => {
    console.error(`❌ API 응답 에러 발생`);
    console.error(`🔍 에러 상세 정보:`, {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: 백엔드 서버에 연결할 수 없습니다.');
      console.error('🔗 서버 URL 확인:', API_BASE_URL);
      console.error('💡 해결 방법: 서버가 실행 중인지, 네트워크 연결을 확인하세요.');
    } else if (error.response) {
      console.error(`📡 HTTP 에러: ${error.response.status} ${error.response.statusText}`);
      console.error(`📄 에러 응답 데이터:`, error.response.data);
    } else {
      console.error(`⚠️ 기타 에러:`, error.message);
    }
    return Promise.reject(error);
  }
);

// API 연결 테스트 함수
export const testAPIConnection = async () => {
  try {
    console.log('🔍 API 연결 테스트 시작...');
    console.log(`🔗 테스트 URL: ${API_BASE_URL}/play`);
    
    const startTime = Date.now();
    const response = await apiClient.get('/play');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ API 연결 성공! 응답 시간: ${responseTime}ms`);
    console.log(`📊 응답 상태: ${response.status}`);
    console.log(`📦 데이터 크기: ${Array.isArray(response.data) ? response.data.length : 'N/A'}개 항목`);
    
    return {
      success: true,
      responseTime,
      status: response.status,
      dataSize: Array.isArray(response.data) ? response.data.length : 0
    };
  } catch (error) {
    console.error('❌ API 연결 테스트 실패:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status
    };
  }
};

// 연극 정보 API
export const playAPI = {
  // 연극 목록 조회 (메인페이지 포스터용)
  getPlays: async () => {
    try {
      console.log('🎭 연극 데이터 요청 시작...');
      console.log(`🔗 요청 URL: ${API_BASE_URL}/play`);
      
      const { data } = await apiClient.get('/play');
      
      console.log('📊 원본 API 응답 데이터:', data);
      console.log('📊 데이터 타입:', typeof data);
      console.log('📊 배열 여부:', Array.isArray(data));
      
      // ▶ 서버가 { items: [...] }를 주므로 배열로 변환
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      
      console.log('✅ 변환된 연극 데이터:', arr);
      console.log(`📈 총 ${arr.length}개의 연극 데이터 로드됨`);
      
      // 각 연극 데이터의 구조 확인
      if (arr.length > 0) {
        console.log('🔍 첫 번째 연극 데이터 구조:', arr[0]);
        console.log('🔍 사용 가능한 필드들:', Object.keys(arr[0]));
      }
      
      return arr;
    } catch (error) {
      console.error('❌ 연극 데이터 로드 실패:', error);
      console.error('🔍 에러 상세:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // 네트워크 에러인 경우 더 자세한 정보 제공
      if (error.code === 'ERR_NETWORK') {
        console.error('🌐 네트워크 연결 문제 감지');
        console.error('🔗 확인할 사항:');
        console.error('  1. 서버가 실행 중인가?');
        console.error('  2. 네트워크 연결이 정상인가?');
        console.error('  3. CORS 설정이 올바른가?');
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

  // 최신 센서 분석 결과 조회 (가장 최근 데이터만)
  getLatestSensorResult: async () => {
    try {
      console.log('🌐 API 호출: GET /sensor-result');
      const { data } = await apiClient.get('/sensor-result');
      console.log('📡 센서 분석 결과:', data);
      
      // 배열인 경우 가장 최근 데이터 반환, 단일 객체인 경우 그대로 반환
      const latestData = Array.isArray(data) ? data[0] : data;
      console.log('📡 최신 센서 분석 결과:', latestData);
      return latestData;
    } catch (error) {
      console.error('❌ 센서 분석 결과 조회 실패:', error);
      console.error('🔍 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export default apiClient;
