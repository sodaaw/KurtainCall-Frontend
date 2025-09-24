// 장소 사진 서비스
import ImageUtils from '../utils/imageUtils';

class PhotoService {
  constructor() {
    this.googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    this.unsplashKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    this.cache = new Map(); // 사진 URL 캐시
    this.failedImages = new Set(); // 실패한 이미지 캐시
    this.crawledImages = new Map(); // 크롤링된 이미지 캐시
  }

  // 구글 플레이스 API를 사용한 사진 가져오기
  async getPlacePhotoFromGoogle(placeName, placeAddress) {
    try {
      // 캐시에서 확인
      const cacheKey = `${placeName}_${placeAddress}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 구글 플레이스 텍스트 검색
      const searchQuery = `${placeName} ${placeAddress}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
        `query=${encodeURIComponent(searchQuery)}&key=${this.googleApiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        if (place.photos && place.photos.length > 0) {
          const photoReference = place.photos[0].photo_reference;
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?` +
            `maxwidth=400&photoreference=${photoReference}&key=${this.googleApiKey}`;
          
          // 캐시에 저장
          this.cache.set(cacheKey, photoUrl);
          return photoUrl;
        }
      }

      return null;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // Unsplash API를 사용한 장소 관련 사진
  async getPhotoFromUnsplash(placeName, category) {
    try {
      const cacheKey = `unsplash_${placeName}_${category}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 카테고리별 검색 키워드
      const searchKeywords = {
        '극장': 'theater performance',
        '박물관': 'museum art',
        '미술관': 'art gallery museum',
        '카페': 'coffee cafe',
        '음식점': 'restaurant food',
        '공원': 'park nature',
        '쇼핑': 'shopping mall',
        '문화시설': 'culture art'
      };

      const keyword = searchKeywords[category] || 'korea culture';
      const response = await fetch(
        `https://api.unsplash.com/search/photos?` +
        `query=${encodeURIComponent(keyword)}&per_page=1&orientation=portrait`,
        {
          headers: {
            'Authorization': `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const photoUrl = data.results[0].urls.regular;
        this.cache.set(cacheKey, photoUrl);
        return photoUrl;
      }

      return null;
    } catch (error) {
      console.error('Unsplash API error:', error);
      return null;
    }
  }

  // 카카오맵 OG 이미지 크롤링 (CORS 프록시 사용)
  async getPhotoFromKakaoMap(placeName, placeAddress) {
    try {
      const cacheKey = `kakao_${placeName}_${placeAddress}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      console.log('카카오맵 OG 이미지 크롤링 시도:', placeName, placeAddress);

      // 1. 카카오맵 검색 URL 생성
      const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
      const kakaoMapUrl = `https://map.kakao.com/link/search/${searchQuery}`;
      
      // 2. CORS 프록시를 통한 HTML 가져오기
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(kakaoMapUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      const html = data.contents;
      
      // 3. OG 이미지 추출
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      
      if (ogImageMatch && ogImageMatch[1]) {
        let imageUrl = ogImageMatch[1];
        
        // HTML 엔티티 디코딩
        imageUrl = imageUrl.replace(/&amp;/g, '&');
        
        // 이미지 유효성 검증
        const isValid = await this.validateImageUrl(imageUrl);
        if (isValid) {
          console.log('✅ 카카오맵 OG 이미지 성공:', imageUrl);
          this.cache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      }

      // 4. OG 이미지를 찾지 못한 경우, 정적 지도 이미지 생성
      console.log('OG 이미지를 찾지 못함, 정적 지도 이미지 생성 시도');
      const staticMapUrl = await this.generateKakaoStaticMap(placeName, placeAddress);
      if (staticMapUrl) {
        this.cache.set(cacheKey, staticMapUrl);
        return staticMapUrl;
      }

      return null;
    } catch (error) {
      console.error('Kakao Map scraping error:', error);
      
      // 크롤링 실패 시 정적 지도 이미지 생성 시도
      try {
        console.log('크롤링 실패, 정적 지도 이미지 생성 시도');
        const staticMapUrl = await this.generateKakaoStaticMap(placeName, placeAddress);
        return staticMapUrl;
      } catch (staticError) {
        console.error('Kakao static map error:', staticError);
        return null;
      }
    }
  }

  // 카카오맵 정적 이미지 생성
  async generateKakaoStaticMap(placeName, placeAddress) {
    try {
      // 주소를 좌표로 변환 (지오코딩)
      const coordinates = await this.geocodeAddress(placeAddress);
      if (!coordinates) {
        return null;
      }

      const { lat, lng } = coordinates;
      
      // 카카오맵 정적 이미지 URL 생성
      const staticMapUrl = `https://map3.daum.net/staticmap/og?` +
        `type=place&` +
        `srs=wgs84&` +
        `size=400x300&` +
        `service=placeweb&` +
        `m=${lng},${lat}`;

      console.log('카카오맵 정적 이미지 생성:', staticMapUrl);
      return staticMapUrl;
    } catch (error) {
      console.error('Static map generation error:', error);
      return null;
    }
  }

  // 주소를 좌표로 변환 (지오코딩)
  async geocodeAddress(address) {
    try {
      // 카카오맵 지오코딩 API 사용
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?` +
        `query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK e7abf7f4973d0c8697effa3139a25e04`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        return {
          lat: parseFloat(doc.y),
          lng: parseFloat(doc.x)
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // 카테고리별 기본 이미지 매핑 (개선된 버전)
  getCategoryImageUrl(category, placeName) {
    const categoryImages = {
      '극장': '/images/theater.jpg',
      '공연장': '/images/theater.jpg',
      '소극장': '/images/theater.jpg',
      '박물관': '/images/museum.jpg',
      '역사관': '/images/museum.jpg',
      '과학관': '/images/museum.jpg',
      '미술관': '/images/gallery.jpg',
      '갤러리': '/images/gallery.jpg',
      '아트센터': '/images/gallery.jpg',
      '전시회': '/images/exhibition.jpg',
      '전시관': '/images/exhibition.jpg',
      '박람회': '/images/exhibition.jpg',
      '콘서트홀': '/images/concert.jpg',
      '음악회': '/images/concert.jpg',
      '카페': '/images/cafe.jpg',
      '커피': '/images/cafe.jpg',
      '음식점': '/images/restaurant.jpg',
      '레스토랑': '/images/restaurant.jpg',
      '공원': '/images/park.jpg',
      '쇼핑': '/images/shopping.jpg',
      '문화시설': '/images/culture.jpg',
      '관광명소': '/images/tourism.jpg'
    };

    // 카테고리에서 키워드 찾기
    for (const [keyword, imageUrl] of Object.entries(categoryImages)) {
      if (category.includes(keyword)) {
        return imageUrl;
      }
    }

    // 기본 이미지
    return '/images/fallback.jpg';
  }

  // Pixabay API를 사용한 무료 이미지 검색
  async getPhotoFromPixabay(placeName, category) {
    try {
      const cacheKey = `pixabay_${placeName}_${category}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 카테고리별 검색 키워드
      const searchKeywords = {
        '극장': 'theater performance stage',
        '박물관': 'museum art history',
        '미술관': 'art gallery museum',
        '카페': 'coffee cafe',
        '음식점': 'restaurant food dining',
        '공원': 'park nature garden',
        '쇼핑': 'shopping mall store',
        '문화시설': 'culture art building'
      };

      const keyword = searchKeywords[category] || 'korea culture';
      
      // Pixabay 무료 API 사용 (일일 제한 있음)
      const response = await fetch(
        `https://pixabay.com/api/?` +
        `key=38497680-2f8c8a5e8e8b9b5c1b8b8b8b&` +
        `q=${encodeURIComponent(keyword)}&` +
        `image_type=photo&` +
        `orientation=vertical&` +
        `category=places&` +
        `per_page=3&` +
        `safesearch=true`
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.hits && data.hits.length > 0) {
        const photoUrl = data.hits[0].webformatURL;
        this.cache.set(cacheKey, photoUrl);
        return photoUrl;
      }

      return null;
    } catch (error) {
      console.error('Pixabay API error:', error);
      return null;
    }
  }

  // Lorem Picsum을 사용한 랜덤 이미지 (카테고리별 색상)
  getRandomImageFromLoremPicsum(category) {
    const categorySeeds = {
      '극장': 'theater',
      '박물관': 'museum',
      '미술관': 'gallery',
      '카페': 'coffee',
      '음식점': 'restaurant',
      '공원': 'park',
      '쇼핑': 'shopping',
      '문화시설': 'culture'
    };

    const seed = categorySeeds[category] || 'korea';
    const width = 400;
    const height = 300;
    
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }

  // 크롤링된 이미지 추가
  addCrawledImage(placeName, placeAddress, crawledImageUrl) {
    const cacheKey = `${placeName}_${placeAddress}`;
    this.crawledImages.set(cacheKey, crawledImageUrl);
    console.log('크롤링 이미지 추가:', placeName, crawledImageUrl);
  }

  // 크롤링된 이미지 가져오기
  async getCrawledImage(placeName, placeAddress) {
    try {
      const cacheKey = `${placeName}_${placeAddress}`;
      
      if (this.crawledImages.has(cacheKey)) {
        const crawledUrl = this.crawledImages.get(cacheKey);
        const realImageUrl = ImageUtils.extractRealImageUrl(crawledUrl);
        
        if (realImageUrl) {
          const isValid = await ImageUtils.validateImageUrl(realImageUrl);
          if (isValid) {
            console.log('✅ 크롤링 이미지 사용:', placeName, realImageUrl);
            return realImageUrl;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('크롤링 이미지 처리 실패:', error);
      return null;
    }
  }

  // 메인 메서드: 여러 소스에서 사진 가져오기 시도
  async getPlacePhoto(placeName, placeAddress, category) {
    try {
      const cacheKey = `${placeName}_${placeAddress}_${category}`;
      
      // 캐시에서 확인
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 실패한 이미지인지 확인
      if (this.failedImages.has(cacheKey)) {
        return this.getCategoryImageUrl(category, placeName);
      }

      let imageUrl = null;

      // 0. 크롤링된 이미지 우선 확인
      try {
        imageUrl = await this.getCrawledImage(placeName, placeAddress);
        if (imageUrl) {
          this.cache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        console.log('❌ 크롤링 이미지 실패:', error);
      }

      // 1. 카카오맵 크롤링 시도 (CORS 문제로 비활성화)
      // try {
      //   imageUrl = await this.getPhotoFromKakaoMap(placeName, placeAddress);
      //   if (imageUrl) {
      //     // 이미지 유효성 검증
      //     const isValid = await this.validateImageUrl(imageUrl);
      //     if (isValid) {
      //       console.log('✅ 카카오맵 이미지 성공:', placeName, imageUrl);
      //       this.cache.set(cacheKey, imageUrl);
      //       return imageUrl;
      //     }
      //   }
      // } catch (error) {
      //   console.log('❌ 카카오맵 크롤링 실패:', error);
      // }

      // 1. Lorem Picsum 시도 (카테고리별 랜덤 이미지) - 가장 안정적
      try {
        imageUrl = this.getRandomImageFromLoremPicsum(category);
        console.log('✅ Lorem Picsum 이미지 사용:', placeName, imageUrl);
        this.cache.set(cacheKey, imageUrl);
        return imageUrl;
      } catch (error) {
        console.log('Lorem Picsum 실패:', error);
      }

      // 2. Pixabay API 시도 (무료, 제한 있음)
      try {
        imageUrl = await this.getPhotoFromPixabay(placeName, category);
        if (imageUrl) {
          // 이미지 유효성 검증
          const isValid = await this.validateImageUrl(imageUrl);
          if (isValid) {
            console.log('✅ Pixabay 이미지 성공:', placeName, imageUrl);
            this.cache.set(cacheKey, imageUrl);
            return imageUrl;
          }
        }
      } catch (error) {
        console.log('❌ Pixabay API 실패:', error);
      }

      // 3. 구글 플레이스 API 시도 (API 키가 있는 경우)
      if (this.googleApiKey) {
        try {
          imageUrl = await this.getPlacePhotoFromGoogle(placeName, placeAddress);
          if (imageUrl) {
            const isValid = await this.validateImageUrl(imageUrl);
            if (isValid) {
              this.cache.set(cacheKey, imageUrl);
              return imageUrl;
            }
          }
        } catch (error) {
          console.log('Google Places API 실패:', error);
        }
      }

      // 4. 카테고리별 기본 이미지 사용
      imageUrl = this.getCategoryImageUrl(category, placeName);
      this.cache.set(cacheKey, imageUrl);
      return imageUrl;

    } catch (error) {
      console.error('Photo service error:', error);
      return this.getCategoryImageUrl(category, placeName);
    }
  }

  // 실시간 이미지 검증
  async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // 5초 타임아웃
      setTimeout(() => resolve(false), 5000);
    });
  }

  // 이미지 최적화 (크기 조정)
  optimizeImageUrl(url, width = 400, height = 300) {
    if (!url) return url;
    
    // 구글 플레이스 API 이미지 최적화
    if (url.includes('maps.googleapis.com')) {
      return url.replace(/maxwidth=\d+/, `maxwidth=${width}`);
    }
    
    // Unsplash 이미지 최적화
    if (url.includes('unsplash.com')) {
      return url.replace(/w=\d+/, `w=${width}`);
    }
    
    return url;
  }
}

// 싱글톤 인스턴스
const photoService = new PhotoService();
export default photoService;
