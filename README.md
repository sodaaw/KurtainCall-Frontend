# Frontend Project

## API 연동 설정

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# API 기본 URL 설정
REACT_APP_API_BASE_URL=http://localhost:8080/api

# 개발 환경 설정
NODE_ENV=development
```

### 2. 백엔드 서버 실행
백엔드 서버가 `http://localhost:8080`에서 실행되고 있는지 확인하세요.

### 3. API 엔드포인트
- **연극 목록**: `GET /api/play`
- **카테고리별 연극**: `GET /api/play` (프론트엔드에서 필터링)

## 개발 서버 실행

```bash
npm start
```

## 빌드

```bash
npm run build
```

## 주요 기능

- 메인페이지에서 API를 통한 연극 데이터 로딩
- 포스터 캐러셀 (5초마다 자동 전환)
- 카테고리별 필터링
- 이벤트 캘린더
- 반응형 디자인
