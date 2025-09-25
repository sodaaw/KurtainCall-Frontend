# CulturaLink - 사용자 상태에 맞는 문화시설 추천 큐레이션 웹앱

로컬 공연 정보를 큐레이션하고 생체데이터 바탕 맞춤 추천을 제공하는 프론트엔드 애플리케이션입니다.

## 주요 기능

- 공연/이벤트 정보 목록 및 추천
- 서울 지도 연동(공연장 위치, 지역별 탐색)
- 장르/카테고리별 탐색
- 기기 번호 입력을 통한 로그인
- 번역 보조
- 웨어러블 기기 바탕의 생체 데이터 분석 및 시각화

## 기술 스택

- React, React Router DOM
- Axios
- CSS
- TopoJSON

## 설치 및 실행

```bash
npm install
npm start
```

프로덕션 빌드:

```bash
npm run build
```

## 프로젝트 구조(간단)

```
Frontend/
└── src/
    ├── components/
    ├── MainPage/
    ├── Map/
    ├── Genre/
    ├── Community/
    ├── Login/
    ├── services/
    └── index.js, App.js, index.css
```

## 환경 설정

### 로컬 개발 환경

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# 카카오 API 키 (REST API 키)
REACT_APP_KAKAO_API_KEY=your_kakao_rest_api_key_here

# 백엔드 API URL (선택사항)
REACT_APP_API_BASE_URL=https://re-local.onrender.com/api
```

### Vercel 배포 환경

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

1. Vercel 프로젝트 대시보드로 이동
2. Settings → Environment Variables
3. 다음 변수들을 추가:
   - `REACT_APP_KAKAO_API_KEY`: 카카오 개발자 센터에서 발급받은 REST API 키
   - `REACT_APP_API_BASE_URL`: 백엔드 API URL (선택사항)

### 카카오 API 키 발급 방법

1. [카카오 개발자 센터](https://developers.kakao.com) 접속
2. 애플리케이션 생성 또는 기존 애플리케이션 선택
3. 플랫폼 설정에서 Web 플랫폼 추가 (도메인: http://localhost:3000)
4. 앱 키에서 **REST API 키** 복사 (JavaScript 키가 아님!)
5. 환경 변수에 설정

**중요**: REST API 키를 사용해야 합니다. JavaScript 키가 아닙니다!

### API 기본 설정

- API 기본 URL은 `src/services/api.js`에서 상수로 설정되어 있습니다.
  - 기본값: `https://re-local.onrender.com/api`
- 카카오 API 키는 `src/services/locationService.js`에서 환경 변수로 관리됩니다.

## 스크립트

- 개발 서버: `npm start`
- 테스트: `npm test`
- 빌드: `npm run build`
- 설정 추출: `npm run eject`

## 라이선스

MIT License