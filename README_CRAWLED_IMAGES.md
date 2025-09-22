# 🕷️ 크롤링 이미지 활용 가이드

카카오맵에서 크롤링한 이미지를 React 앱에서 활용하는 완벽한 가이드입니다.

## 📋 목차

- [개요](#개요)
- [설치 및 설정](#설치-및-설정)
- [기본 사용법](#기본-사용법)
- [고급 사용법](#고급-사용법)
- [API 참조](#api-참조)
- [예제](#예제)
- [문제 해결](#문제-해결)

## 🎯 개요

이 가이드는 카카오맵에서 크롤링한 이미지 URL을 React 앱에서 효과적으로 활용하는 방법을 보여줍니다.

### 주요 기능

- ✅ 크롤링된 이미지 URL 디코딩
- ✅ 이미지 유효성 실시간 검증
- ✅ PhotoService와 완벽한 통합
- ✅ 우선순위 기반 이미지 선택
- ✅ 캐싱 및 성능 최적화

## 🚀 설치 및 설정

### 1. 필요한 파일들

```
src/
├── utils/
│   └── imageUtils.js          # 이미지 URL 처리 유틸리티
├── services/
│   └── photoService.js        # 사진 서비스 (수정됨)
└── components/
    ├── CrawledImageDemo.jsx   # 기본 데모
    ├── CrawledImageIntegration.jsx  # 통합 예제
    └── CrawledImageTest.jsx   # 테스트 컴포넌트
```

### 2. 의존성 설치

```bash
npm install
```

## 📖 기본 사용법

### 1. 크롤링된 이미지 URL 디코딩

```javascript
import ImageUtils from '../utils/imageUtils';

// 크롤링된 이미지 URL
const crawledUrl = '//img1.kakaocdn.net/cthumb/local/C408x408.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2F...';

// 실제 이미지 URL 추출
const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);
console.log('디코딩된 URL:', realImageUrl);
```

### 2. 이미지 유효성 검증

```javascript
// 이미지 유효성 검증
const isValid = await ImageUtils.validateImageUrl(realImageUrl);

if (isValid) {
  console.log('✅ 이미지가 유효합니다');
} else {
  console.log('❌ 이미지를 불러올 수 없습니다');
}
```

### 3. PhotoService 통합

```javascript
import photoService from '../services/photoService';

// 크롤링된 이미지를 PhotoService에 추가
photoService.addCrawledImage(placeName, placeAddress, crawledUrl);

// 장소 이미지 가져오기 (크롤링 이미지 우선)
const imageUrl = await photoService.getPlacePhoto(placeName, placeAddress, category);
```

## 🔧 고급 사용법

### 1. 장소 데이터에 크롤링 이미지 적용

```javascript
const processPlaceWithCrawledImage = async (place, crawledImageUrl) => {
  try {
    // 크롤링된 이미지 처리
    const realImageUrl = ImageUtils.extractRealImageUrl(crawledImageUrl);
    
    if (realImageUrl) {
      const isValid = await ImageUtils.validateImageUrl(realImageUrl);
      
      if (isValid) {
        // PhotoService에 크롤링 이미지 추가
        photoService.addCrawledImage(place.name, place.address, crawledImageUrl);
        
        return {
          ...place,
          imageUrl: realImageUrl,
          imageSource: 'crawled'
        };
      }
    }
    
    // 크롤링 이미지가 유효하지 않은 경우 기본 이미지 사용
    const fallbackUrl = await photoService.getPlacePhoto(place.name, place.address, place.category);
    return {
      ...place,
      imageUrl: fallbackUrl,
      imageSource: 'service'
    };
  } catch (error) {
    console.error('크롤링 이미지 처리 실패:', error);
    return place;
  }
};
```

### 2. React 컴포넌트에서 사용

```javascript
import React, { useState, useEffect } from 'react';
import ImageUtils from '../utils/imageUtils';
import photoService from '../services/photoService';

const PlaceCard = ({ place, crawledImageUrl }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageSource, setImageSource] = useState('loading');
  
  useEffect(() => {
    const loadImage = async () => {
      try {
        // 1. 크롤링된 이미지가 있는 경우 처리
        if (crawledImageUrl) {
          const realUrl = ImageUtils.extractRealImageUrl(crawledImageUrl);
          const isValid = await ImageUtils.validateImageUrl(realUrl);
          
          if (isValid) {
            setImageUrl(realUrl);
            setImageSource('crawled');
            return;
          }
        }
        
        // 2. PhotoService에서 이미지 가져오기
        const serviceUrl = await photoService.getPlacePhoto(
          place.name, 
          place.address, 
          place.category
        );
        setImageUrl(serviceUrl);
        setImageSource('service');
      } catch (error) {
        console.error('이미지 로드 실패:', error);
        setImageUrl('/images/fallback.jpg');
        setImageSource('fallback');
      }
    };
    
    loadImage();
  }, [place, crawledImageUrl]);
  
  return (
    <div className="place-card">
      <div className="image-container">
        <img src={imageUrl} alt={place.name} />
        <div className="image-source-badge">
          {imageSource === 'crawled' ? '🕷️' : '🔍'}
        </div>
      </div>
      <h3>{place.name}</h3>
      <p>{place.address}</p>
    </div>
  );
};
```

## 📚 API 참조

### ImageUtils

#### `extractRealImageUrl(crawledUrl)`

크롤링된 이미지 URL에서 실제 이미지 URL을 추출합니다.

**매개변수:**
- `crawledUrl` (string): 크롤링된 이미지 URL

**반환값:**
- `string|null`: 디코딩된 실제 이미지 URL

**예제:**
```javascript
const realUrl = ImageUtils.extractRealImageUrl(crawledUrl);
```

#### `validateImageUrl(url)`

이미지 URL의 유효성을 검증합니다.

**매개변수:**
- `url` (string): 검증할 이미지 URL

**반환값:**
- `Promise<boolean>`: 이미지 유효성 여부

**예제:**
```javascript
const isValid = await ImageUtils.validateImageUrl(imageUrl);
```

#### `selectBestImageUrl(crawledUrl, fallbackUrl)`

크롤링된 이미지와 대체 이미지 중 최적의 이미지를 선택합니다.

**매개변수:**
- `crawledUrl` (string): 크롤링된 이미지 URL
- `fallbackUrl` (string): 대체 이미지 URL

**반환값:**
- `Promise<string>`: 선택된 이미지 URL

**예제:**
```javascript
const bestUrl = await ImageUtils.selectBestImageUrl(crawledUrl, fallbackUrl);
```

### PhotoService

#### `addCrawledImage(placeName, placeAddress, crawledImageUrl)`

크롤링된 이미지를 PhotoService에 추가합니다.

**매개변수:**
- `placeName` (string): 장소 이름
- `placeAddress` (string): 장소 주소
- `crawledImageUrl` (string): 크롤링된 이미지 URL

**예제:**
```javascript
photoService.addCrawledImage('국립중앙박물관', '서울특별시 용산구 서빙고로 137', crawledUrl);
```

#### `getCrawledImage(placeName, placeAddress)`

PhotoService에서 크롤링된 이미지를 가져옵니다.

**매개변수:**
- `placeName` (string): 장소 이름
- `placeAddress` (string): 장소 주소

**반환값:**
- `Promise<string|null>`: 크롤링된 이미지 URL

**예제:**
```javascript
const crawledImage = await photoService.getCrawledImage(placeName, placeAddress);
```

## 🎨 예제

### 1. 기본 데모

```javascript
import CrawledImageDemo from './components/CrawledImageDemo';

function App() {
  return <CrawledImageDemo />;
}
```

### 2. 통합 예제

```javascript
import CrawledImageIntegration from './components/CrawledImageIntegration';

function App() {
  return <CrawledImageIntegration />;
}
```

### 3. 테스트 컴포넌트

```javascript
import CrawledImageTest from './components/CrawledImageTest';

function App() {
  return <CrawledImageTest />;
}
```

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1. CORS 오류

**문제:** 크롤링된 이미지를 불러올 때 CORS 오류가 발생합니다.

**해결책:**
```javascript
// 이미지 유효성 검증 시 CORS 오류 처리
const validateImageUrl = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    setTimeout(() => resolve(false), 5000);
  });
};
```

#### 2. 이미지 로드 실패

**문제:** 크롤링된 이미지가 로드되지 않습니다.

**해결책:**
```javascript
// 이미지 로드 실패 시 대체 이미지 사용
const handleImageError = (e) => {
  e.target.src = '/images/fallback.jpg';
};

<img 
  src={imageUrl} 
  alt={place.name} 
  onError={handleImageError}
/>
```

#### 3. URL 디코딩 실패

**문제:** 크롤링된 URL을 디코딩할 수 없습니다.

**해결책:**
```javascript
// URL 디코딩 전 유효성 검사
const extractRealImageUrl = (crawledUrl) => {
  try {
    if (!crawledUrl || typeof crawledUrl !== 'string') {
      return null;
    }
    
    // URL 형식 검증
    if (!crawledUrl.includes('fname=')) {
      return null;
    }
    
    // 디코딩 시도
    const urlParams = new URLSearchParams(crawledUrl.split('?')[1]);
    const fname = urlParams.get('fname');
    
    return fname ? decodeURIComponent(fname) : null;
  } catch (error) {
    console.error('URL 디코딩 실패:', error);
    return null;
  }
};
```

## 📞 지원

문제가 발생하거나 질문이 있으시면 언제든지 연락주세요!

---

**참고:** 이 가이드는 카카오맵 크롤링 이미지를 React 앱에서 활용하는 방법을 보여줍니다. 실제 프로덕션 환경에서는 적절한 에러 핸들링과 성능 최적화를 고려해야 합니다.

