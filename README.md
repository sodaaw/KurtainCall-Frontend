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

- API 기본 URL은 `src/services/api.js`에서 상수로 설정되어 있습니다.
  - 기본값: `https://re-local.onrender.com/api`
- 별도의 `.env` 없이 동작합니다.

## 스크립트

- 개발 서버: `npm start`
- 테스트: `npm test`
- 빌드: `npm run build`
- 설정 추출: `npm run eject`

## 라이선스

MIT License