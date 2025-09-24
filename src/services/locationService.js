// GPS 위치 기반 추천 장소 서비스
import photoService from './photoService';

class LocationService {
  constructor() {
    // 카카오 개발자 센터의 REST API 키 사용
    this.kakaoApiKey = 'e7abf7f4973d0c8697effa3139a25e04';
    this.userLocation = null;
    this.photoService = photoService;
  }

  // 사용자 위치 가져오기 (GPS)
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS를 지원하지 않는 브라우저입니다.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.userLocation = { lat: latitude, lng: longitude };
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('GPS 위치 가져오기 실패:', error);
          // GPS 실패 시 서울 시청을 기본 위치로 사용
          const defaultLocation = { lat: 37.5665, lng: 126.9780 };
          this.userLocation = defaultLocation;
          resolve(defaultLocation);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 60000 // 1분 캐시
        }
      );
    });
  }

  // 카카오맵 API를 이용한 장소 검색
  async searchPlacesByKeyword(keyword, radius = 5000) {
    try {
      const location = await this.getCurrentLocation();
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?` +
        `query=${encodeURIComponent(keyword)}&x=${location.lng}&y=${location.lat}&radius=${radius}&size=15&sort=distance`,
        {
          headers: {
            Authorization: `KakaoAK ${this.kakaoApiKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformKakaoData(data.documents);
    } catch (error) {
      console.error('장소 검색 실패:', error);
      return [];
    }
  }

  // 카테고리별 장소 검색
  async searchPlacesByCategory(categoryCode, radius = 5000) {
    try {
      const location = await this.getCurrentLocation();
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?` +
        `category_group_code=${categoryCode}&x=${location.lng}&y=${location.lat}&radius=${radius}&size=15&sort=distance`,
        {
          headers: {
            Authorization: `KakaoAK ${this.kakaoApiKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformKakaoData(data.documents);
    } catch (error) {
      console.error('카테고리 검색 실패:', error);
      return [];
    }
  }

  // 카카오맵 데이터를 앱에서 사용할 형식으로 변환 (빠른 버전)
  transformKakaoData(kakaoDocuments) {
    return kakaoDocuments.map(place => ({
      id: place.id,
      name: place.place_name,
      address: place.address_name,
      roadAddress: place.road_address_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      category: place.category_name,
      phone: place.phone || '',
      url: place.place_url || '',
      rating: place.rating ? parseFloat(place.rating) : 0,
      reviewCount: place.review_count ? parseInt(place.review_count) : 0,
      distance: this.calculateDistance(
        this.userLocation?.lat || 37.5665, 
        this.userLocation?.lng || 126.9780,
        parseFloat(place.y), 
        parseFloat(place.x)
      ),
      // 이모티콘 기반 표시를 위해 imageUrl 제거
      imageUrl: null
    }));
  }

  // 두 지점 간의 거리 계산 (km)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // 소수점 둘째 자리까지
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }


  // 추천 장소 가져오기 (문화시설 위주)
  async getRecommendedPlaces(limit = 10) {
    try {
      const culturePlaces = await this.searchPlacesByCategory('CT1'); // 문화시설
      const touristPlaces = await this.searchPlacesByCategory('AT4'); // 관광명소
      
      // 두 결과를 합치고 중복 제거
      const allPlaces = [...culturePlaces, ...touristPlaces];
      const uniquePlaces = this.removeDuplicates(allPlaces);
      
      // 거리순으로 정렬하고 평점이 있는 것 우선
      const sortedPlaces = uniquePlaces
        .sort((a, b) => {
          // 평점이 있는 것 우선
          if (a.rating > 0 && b.rating === 0) return -1;
          if (a.rating === 0 && b.rating > 0) return 1;
          
          // 평점이 같으면 거리순
          return a.distance - b.distance;
        })
        .slice(0, limit);

      return sortedPlaces;
    } catch (error) {
      console.error('추천 장소 가져오기 실패:', error);
      return [];
    }
  }

  // 중복 제거 (같은 ID나 비슷한 이름의 장소)
  removeDuplicates(places) {
    const seen = new Set();
    return places.filter(place => {
      const key = place.id || place.name;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // 장르별 추천 장소
  async getGenreSpecificPlaces(genre) {
    const genreKeywords = {
      'comedy': ['극장', '공연장', '소극장'],
      'musical': ['뮤지컬', '공연장', '극장'],
      'romance': ['카페', '공원', '미술관'],
      'horror': ['박물관', '전시관', '아트센터'],
      'festival': ['대학가', '문화센터', '아트센터']
    };

    const keywords = genreKeywords[genre] || ['문화시설'];
    let allPlaces = [];

    for (const keyword of keywords) {
      const places = await this.searchPlacesByKeyword(keyword, 8000);
      allPlaces = [...allPlaces, ...places];
    }

    return this.removeDuplicates(allPlaces)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }
}

// 싱글톤 인스턴스 생성
const locationService = new LocationService();
export default locationService;
