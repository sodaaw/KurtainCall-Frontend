# FestiGuard - 공연 큐레이션 플랫폼

FestiGuard은 로컬 공연 정보를 큐레이션하고 사용자에게 맞춤형 추천을 제공하는 웹 애플리케이션입니다.

## 🎭 주요 기능

- **공연 정보 큐레이션**: 다양한 장르의 연극, 뮤지컬 정보 제공
- **지도 기반 검색**: 서울 지역별 공연장 위치 표시 및 검색
- **장르별 필터링**: 코미디, 뮤지컬, 드라마 등 장르별 공연 검색
- **이벤트 캘린더**: 날짜별 공연 일정 확인
- **사용자 인증**: 로그인/회원가입 기능
- **커뮤니티**: 공연 리뷰, 여행 파트너 찾기, 할인 티켓 정보
- **AI 번역**: 다국어 지원 기능
- **개인화 테스트**: 사용자 취향 분석을 통한 맞춤 추천

## 🛠 기술 스택

- **Frontend**: React 19.1.1, React Router DOM
- **지도**: Kakao Maps API
- **HTTP 클라이언트**: Axios
- **스타일링**: CSS3
- **데이터 시각화**: TopoJSON

## 📁 프로젝트 구조

```
src/
├── components/          # 공통 컴포넌트
│   ├── Topnav.jsx      # 상단 네비게이션
│   ├── SearchModal.jsx # 검색 모달
│   ├── Review.jsx      # 리뷰 컴포넌트
│   └── ...
├── MainPage/           # 메인 페이지
│   ├── Main.jsx        # 메인 컴포넌트
│   ├── EventCalendar.jsx # 이벤트 캘린더
│   └── EventPanel.jsx  # 이벤트 패널
├── Map/                # 지도 페이지
│   └── Map.js          # Kakao Maps 연동
├── Genre/              # 장르별 페이지
├── Community/          # 커뮤니티 기능
├── Login/              # 로그인/회원가입
├── services/           # API 서비스
│   └── api.js          # API 클라이언트
└── ...
```

## 🚀 시작하기

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# API 기본 URL 설정
REACT_APP_API_BASE_URL=https://re-local.onrender.com/api

# 개발 환경 설정
NODE_ENV=development
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
```

### 4. 빌드
```bash
npm run build
```

## 🌐 API 엔드포인트

- **연극 목록**: `GET /api/play`
- **카테고리별 조회**: `GET /api/play` (쿼리스트링으로 필터링)

## 🗺 지도 기능

- **Kakao Maps API** 사용
- 서울 지역별 공연장 위치 표시
- 지역 클릭 시 상세 정보 제공
- 주소 기반 지오코딩 지원

## 🎨 주요 페이지

- **메인 페이지** (`/`): 추천 공연 슬라이드, 검색, 장르 필터
- **지도 페이지** (`/map`): 공연장 위치 지도 표시
- **장르 페이지** (`/genre`): 장르별 공연 목록
- **커뮤니티** (`/community`): 리뷰, 파트너 찾기, 할인 정보
- **로그인/회원가입**: 사용자 인증

## 🔧 개발 환경

- Node.js 16+
- React 19.1.1
- npm 또는 yarn

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.