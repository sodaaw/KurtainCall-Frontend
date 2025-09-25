// GPS 위치 기반 추천 장소 서비스
import photoService from './photoService';
const KAKAO_API_KEY = '305a989699c2b85d2d6470b6376d3853';


class LocationService {
  constructor() {
    // 카카오 개발자 센터의 JavaScript 키 사용
    // 배포 환경에서는 환경변수가 제대로 로드되지 않을 수 있으므로 직접 설정
    this.kakaoApiKey = '305a989699c2b85d2d6470b6376d3853';
    this.userLocation = null;
    this.photoService = photoService;
    
    // API 키 유효성 검사
    if (!this.kakaoApiKey || this.kakaoApiKey === 'undefined') {
      console.error('❌ 카카오 API 키가 설정되지 않았습니다.');
      this.kakaoApiKey = '305a989699c2b85d2d6470b6376d3853'; // 기본값 사용
    }
    console.log('🔑 카카오 API 키 설정됨:', this.kakaoApiKey.substring(0, 8) + '...');
  }

  // 사용자 위치 가져오기 (GPS)
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('❌ GPS를 지원하지 않는 브라우저입니다.');
        reject(new Error('GPS를 지원하지 않는 브라우저입니다.'));
        return;
      }

      console.log('📍 GPS 위치 요청 시작...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('🎯 GPS 위치 성공:', { lat: latitude, lng: longitude });
          console.log('🎯 GPS 좌표 상세:', { 
            lat: latitude, 
            lng: longitude, 
            latType: typeof latitude, 
            lngType: typeof longitude 
          });
          this.userLocation = { lat: latitude, lng: longitude };
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('❌ GPS 위치 가져오기 실패:', error);
          console.error('❌ GPS 오류 코드:', error.code);
          console.error('❌ GPS 오류 메시지:', error.message);
          
          // GPS 실패 시 서울 시청을 기본 위치로 사용
          const defaultLocation = { lat: 37.5665, lng: 126.9780 };
          console.log('📍 기본 위치 사용:', defaultLocation);
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
      
      const url = `https://dapi.kakao.com/v2/local/search/category.json?` +
        `category_group_code=${categoryCode}&x=${location.lng}&y=${location.lat}&radius=${radius}&size=15&sort=distance`;
      
      console.log('🔍 카테고리 검색 요청:', {
        categoryCode,
        location,
        url: url.substring(0, 100) + '...',
        apiKey: this.kakaoApiKey.substring(0, 8) + '...'
      });
      
      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${this.kakaoApiKey}`
        }
      });
      
      console.log('📡 카카오 API 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 카카오 API 에러 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ 카카오 API 응답 성공:', data.documents?.length || 0, '개 장소');
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
      ratingCount: place.rating_count ? parseInt(place.rating_count) : 0, // 추천 알고리즘을 위해 추가
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
      console.log('🎯 추천 장소 검색 시작...');
      
      // 병렬로 두 카테고리 검색
      const [culturePlaces, touristPlaces] = await Promise.all([
        this.searchPlacesByCategory('CT1'), // 문화시설
        this.searchPlacesByCategory('AT4')  // 관광명소
      ]);
      
      console.log('📊 검색 결과:', {
        문화시설: culturePlaces.length,
        관광명소: touristPlaces.length
      });
      
      // 두 결과를 합치고 중복 제거
      const allPlaces = [...culturePlaces, ...touristPlaces];
      const uniquePlaces = this.removeDuplicates(allPlaces);
      
      console.log('🔄 중복 제거 후:', uniquePlaces.length, '개 장소');
      
      // API 실패 시 더미 데이터 사용
      if (uniquePlaces.length === 0) {
        console.log('⚠️ API 실패로 더미 데이터 사용');
        return this.getDummyPlaces(limit);
      }
      
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

      console.log('✅ 최종 추천 장소:', sortedPlaces.length, '개');
      return sortedPlaces;
    } catch (error) {
      console.error('추천 장소 가져오기 실패:', error);
      console.log('⚠️ 에러로 인해 더미 데이터 사용');
      return this.getDummyPlaces(limit);
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

  // API 실패 시 사용할 더미 데이터
  getDummyPlaces(limit = 10) {
    const dummyPlaces = [
      {
        id: 'dummy1',
        name: '블루포트 성균관대학교점',
        address: '경기 수원시 장안구 천천동 585',
        roadAddress: '경기 수원시 장안구 천천동 585',
        lat: 37.2959,
        lng: 126.9757,
        category: '음식점 > 카페',
        phone: '031-123-4567',
        url: '',
        rating: 4.2,
        reviewCount: 15,
        ratingCount: 15,
        distance: 0.19,
        imageUrl: null
      },
      {
        id: 'dummy2',
        name: '비트박스 성균관대학교수원점',
        address: '경기 수원시 장안구 천천동 585',
        roadAddress: '경기 수원시 장안구 천천동 585',
        lat: 37.2959,
        lng: 126.9757,
        category: '음식점 > 카페 > 테마카페 > 무인카페',
        phone: '031-123-4568',
        url: '',
        rating: 4.0,
        reviewCount: 8,
        ratingCount: 8,
        distance: 0.23,
        imageUrl: null
      },
      {
        id: 'dummy3',
        name: '몽키키친',
        address: '경기 수원시 장안구 율전동 439',
        roadAddress: '경기 수원시 장안구 율전동 439',
        lat: 37.2960,
        lng: 126.9760,
        category: '음식점 > 양식',
        phone: '031-123-4569',
        url: '',
        rating: 4.5,
        reviewCount: 23,
        ratingCount: 23,
        distance: 0.26,
        imageUrl: null
      },
      {
        id: 'dummy4',
        name: 'SY카페',
        address: '경기 수원시 장안구 천천동 300',
        roadAddress: '경기 수원시 장안구 천천동 300',
        lat: 37.2958,
        lng: 126.9755,
        category: '음식점 > 카페',
        phone: '031-123-4570',
        url: '',
        rating: 3.8,
        reviewCount: 12,
        ratingCount: 12,
        distance: 0.28,
        imageUrl: null
      },
      {
        id: 'dummy5',
        name: '일공공스터디카페',
        address: '경기 수원시 장안구 율전동 290',
        roadAddress: '경기 수원시 장안구 율전동 290',
        lat: 37.2961,
        lng: 126.9761,
        category: '서비스, 산업 > 전문대행 > 공간대여 > 스터디카페, 스터디룸',
        phone: '031-123-4571',
        url: '',
        rating: 4.3,
        reviewCount: 18,
        ratingCount: 18,
        distance: 0.30,
        imageUrl: null
      },
      {
        id: 'dummy6',
        name: '카페디에센셜',
        address: '경기 수원시 장안구 율전동 276-4',
        roadAddress: '경기 수원시 장안구 율전동 276-4',
        lat: 37.2962,
        lng: 126.9762,
        category: '음식점 > 카페 > 커피전문점',
        phone: '031-123-4572',
        url: '',
        rating: 4.1,
        reviewCount: 14,
        ratingCount: 14,
        distance: 0.30,
        imageUrl: null
      }
    ];

    console.log('🎭 더미 데이터 사용:', dummyPlaces.length, '개 장소');
    return dummyPlaces.slice(0, limit);
  }

  // 장르별 추천 장소
  async getGenreSpecificPlaces(genre) {
    try {
      const genreKeywords = {
        'comedy': ['극장', '공연장', '소극장'],
        'musical': ['뮤지컬', '공연장', '극장'],
        'romance': ['카페', '공원', '미술관'],
        'horror': ['박물관', '전시관', '아트센터'],
        'festival': ['대학가', '문화센터', '아트센터'],
        // 생체데이터 기반 카테고리
        'cafe': ['카페', '커피', '스타벅스', '이디야', '투썸플레이스', '카페베네', '엔젤리너스'],
        'theater': ['극장', '공연장', '소극장', '뮤지컬'],
        'museum': ['박물관', '역사관', '과학관', '기념관'],
        'gallery': ['미술관', '갤러리', '아트센터', '전시관'],
        'exhibition': ['전시회', '전시관', '박람회', '아트센터'],
        'concert': ['콘서트홀', '공연장', '음악회', '아트센터']
      };

      const keywords = genreKeywords[genre] || ['문화시설'];
      let allPlaces = [];

      for (const keyword of keywords) {
        const places = await this.searchPlacesByKeyword(keyword, 8000);
        allPlaces = [...allPlaces, ...places];
      }

      const result = this.removeDuplicates(allPlaces)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8);

      // API 실패 시 더미 데이터 사용
      if (result.length === 0) {
        console.log('⚠️ 장르별 API 실패로 더미 데이터 사용');
        return this.getDummyPlaces(8);
      }

      return result;
    } catch (error) {
      console.error('장르별 추천 장소 실패:', error);
      console.log('⚠️ 에러로 인해 더미 데이터 사용');
      return this.getDummyPlaces(8);
    }
  }
}

// 싱글톤 인스턴스 생성
const locationService = new LocationService();
export default locationService;
