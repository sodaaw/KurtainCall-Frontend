// 이미지 URL 처리 유틸리티
class ImageUtils {
  /**
   * 카카오맵 크롤링 이미지 URL에서 실제 이미지 URL 추출
   * @param {string} crawledUrl - 크롤링된 이미지 URL
   * @returns {string|null} - 디코딩된 실제 이미지 URL
   */
  static extractRealImageUrl(crawledUrl) {
    try {
      if (!crawledUrl) return null;
      
      // 카카오 CDN URL에서 fname 파라미터 추출
      if (crawledUrl.includes('kakaocdn.net') && crawledUrl.includes('fname=')) {
        const urlParams = new URLSearchParams(crawledUrl.split('?')[1]);
        const fname = urlParams.get('fname');
        
        if (fname) {
          // URL 디코딩
          const decodedUrl = decodeURIComponent(fname);
          console.log('✅ 크롤링 이미지 URL 디코딩 성공:', decodedUrl);
          return decodedUrl;
        }
      }
      
      // 이미 완전한 URL인 경우
      if (crawledUrl.startsWith('http://') || crawledUrl.startsWith('https://')) {
        return crawledUrl;
      }
      
      // 프로토콜이 없는 경우 https 추가
      if (crawledUrl.startsWith('//')) {
        return `https:${crawledUrl}`;
      }
      
      return null;
    } catch (error) {
      console.error('이미지 URL 추출 실패:', error);
      return null;
    }
  }

  /**
   * 이미지 URL 유효성 검증
   * @param {string} url - 검증할 이미지 URL
   * @returns {Promise<boolean>} - 유효한 이미지인지 여부
   */
  static async validateImageUrl(url) {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // 5초 타임아웃
      setTimeout(() => resolve(false), 5000);
    });
  }

  /**
   * 크롤링된 이미지 URL을 우선적으로 사용하는 이미지 URL 선택
   * @param {string} crawledUrl - 크롤링된 이미지 URL
   * @param {string} fallbackUrl - 대체 이미지 URL
   * @returns {Promise<string>} - 최종 선택된 이미지 URL
   */
  static async selectBestImageUrl(crawledUrl, fallbackUrl) {
    try {
      // 크롤링된 이미지 URL 처리
      const realImageUrl = this.extractRealImageUrl(crawledUrl);
      
      if (realImageUrl) {
        // 크롤링된 이미지 유효성 검증
        const isValid = await this.validateImageUrl(realImageUrl);
        if (isValid) {
          console.log('✅ 크롤링 이미지 사용:', realImageUrl);
          return realImageUrl;
        }
      }
      
      // 크롤링 이미지가 유효하지 않은 경우 대체 이미지 사용
      console.log('⚠️ 크롤링 이미지 실패, 대체 이미지 사용:', fallbackUrl);
      return fallbackUrl;
    } catch (error) {
      console.error('이미지 URL 선택 실패:', error);
      return fallbackUrl;
    }
  }

  /**
   * 이미지 URL 최적화 (크기 조정)
   * @param {string} url - 원본 이미지 URL
   * @param {number} width - 원하는 너비
   * @param {number} height - 원하는 높이
   * @returns {string} - 최적화된 이미지 URL
   */
  static optimizeImageUrl(url, width = 400, height = 300) {
    if (!url) return url;
    
    // 네이버 블로그 이미지 최적화
    if (url.includes('postfiles.pstatic.net')) {
      // 네이버 블로그 이미지는 type 파라미터로 크기 조정 가능
      if (url.includes('type=')) {
        return url.replace(/type=\w+/, `type=w${width}`);
      } else {
        return `${url}?type=w${width}`;
      }
    }
    
    // 카카오 CDN 이미지 최적화
    if (url.includes('kakaocdn.net')) {
      // C408x408.q50 형식에서 크기 조정
      return url.replace(/C\d+x\d+\.q\d+/, `C${width}x${height}.q50`);
    }
    
    return url;
  }

  /**
   * 크롤링된 이미지 데이터를 장소 객체에 적용
   * @param {Object} place - 장소 객체
   * @param {string} crawledImageUrl - 크롤링된 이미지 URL
   * @returns {Promise<Object>} - 이미지 URL이 적용된 장소 객체
   */
  static async applyCrawledImage(place, crawledImageUrl) {
    try {
      if (!crawledImageUrl) return place;
      
      const realImageUrl = this.extractRealImageUrl(crawledImageUrl);
      if (realImageUrl) {
        const isValid = await this.validateImageUrl(realImageUrl);
        if (isValid) {
          return {
            ...place,
            imageUrl: realImageUrl,
            imageSource: 'crawled' // 이미지 소스 표시
          };
        }
      }
      
      return place;
    } catch (error) {
      console.error('크롤링 이미지 적용 실패:', error);
      return place;
    }
  }
}

export default ImageUtils;

