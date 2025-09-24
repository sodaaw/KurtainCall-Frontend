// 단순화된 장소 사진 서비스 - 카테고리별 예시 사진 시스템
class PhotoService {
  constructor() {
    this.cache = new Map(); // 사진 URL 캐시
  }

  // 카테고리별 예시 사진 매핑
  getCategoryImageUrl(category) {
    const categoryImages = {
      // 공연/연극 관련
      '극장': '/images/category/theater.jpg',
      '공연장': '/images/category/theater.jpg',
      '소극장': '/images/category/theater.jpg',
      '연극': '/images/category/theater.jpg',
      '공연': '/images/category/theater.jpg',
      '뮤지컬': '/images/category/musical.jpg',
      '콘서트홀': '/images/category/concert.jpg',
      '음악회': '/images/category/concert.jpg',
      
      // 문화/예술 관련
      '박물관': '/images/category/museum.jpg',
      '역사관': '/images/category/museum.jpg',
      '과학관': '/images/category/museum.jpg',
      '미술관': '/images/category/gallery.jpg',
      '갤러리': '/images/category/gallery.jpg',
      '아트센터': '/images/category/gallery.jpg',
      '전시회': '/images/category/exhibition.jpg',
      '전시관': '/images/category/exhibition.jpg',
      '박람회': '/images/category/exhibition.jpg',
      '문화시설': '/images/category/culture.jpg',
      '문화센터': '/images/category/culture.jpg',
      
      // 관광/여가 관련
      '관광명소': '/images/category/tourism.jpg',
      '관광지': '/images/category/tourism.jpg',
      '공원': '/images/category/park.jpg',
      '쇼핑': '/images/category/shopping.jpg',
      '쇼핑몰': '/images/category/shopping.jpg',
      
      // 음식/카페 관련
      '카페': '/images/category/cafe.jpg',
      '커피': '/images/category/cafe.jpg',
      '음식점': '/images/category/restaurant.jpg',
      '레스토랑': '/images/category/restaurant.jpg',
      '식당': '/images/category/restaurant.jpg'
    };

    // 카테고리에서 키워드 찾기 (부분 일치)
    for (const [keyword, imageUrl] of Object.entries(categoryImages)) {
      if (category.includes(keyword)) {
        return imageUrl;
      }
    }

    // 기본 이미지
    return '/images/category/default.jpg';
  }

  // 메인 메서드: 카테고리별 예시 사진 반환
  async getPlacePhoto(placeName, placeAddress, category) {
    try {
      const cacheKey = `${placeName}_${placeAddress}_${category}`;
      
      // 캐시에서 확인
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 카테고리별 예시 사진 반환
      const imageUrl = this.getCategoryImageUrl(category);
      this.cache.set(cacheKey, imageUrl);
      
      console.log(`📸 카테고리별 예시 사진 사용: ${category} -> ${imageUrl}`);
      return imageUrl;

    } catch (error) {
      console.error('Photo service error:', error);
      return '/images/category/default.jpg';
    }
  }

  // 이미지 최적화 (크기 조정)
  optimizeImageUrl(url, width = 400, height = 300) {
    if (!url) return url;
    return url; // 로컬 이미지는 최적화 불필요
  }
}

// 싱글톤 인스턴스
const photoService = new PhotoService();
export default photoService;
