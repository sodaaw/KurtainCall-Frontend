// src/services/search.js
import { http } from './http';

// 한글-영어 장르 매핑
const genreMapping = {
  '코미디': 'comedy',
  '코메디': 'comedy',
  '웃음': 'comedy',
  '유머': 'comedy',
  '뮤지컬': 'musical',
  '음악': 'musical',
  '노래': 'musical',
  '드라마': 'drama',
  '연극': 'drama',
  '공연': 'drama',
  '로맨스': 'romance',
  '사랑': 'romance',
  '로맨틱': 'romance',
  '액션': 'action',
  '스릴러': 'thriller',
  '공포': 'horror',
  '호러': 'horror',
  '무서운': 'horror',
  '판타지': 'fantasy',
  'SF': 'sci-fi',
  '사이언스픽션': 'sci-fi',
  '과학': 'sci-fi',
  '가족': 'family',
  '어린이': 'children',
  '아동': 'children',
  '청소년': 'teen',
  '성인': 'adult',
  '클래식': 'classical',
  '전통': 'traditional',
  '현대': 'contemporary',
  '실험': 'experimental',
  '실험적': 'experimental'
};

// 검색어 변환 함수
const translateSearchQuery = (query) => {
  const lowerQuery = query.trim();
  
  // 한글 장르가 포함된 경우 영어로 변환
  for (const [korean, english] of Object.entries(genreMapping)) {
    if (lowerQuery.includes(korean)) {
      return lowerQuery.replace(korean, english);
    }
  }
  
  return query; // 변환할 것이 없으면 원본 반환
};

export const searchAPI = {
  search: (q, limit = 20) => {
    // 한글 검색어를 영어로 변환
    const translatedQuery = translateSearchQuery(q);
    
    // 변환된 검색어가 원본과 다르면 변환된 것을 사용, 같으면 원본 사용
    const finalQuery = translatedQuery !== q ? translatedQuery : q;
    
    console.log(`검색어 변환: "${q}" → "${finalQuery}"`); // 디버깅용
    
    // 변환된 검색어로 검색 (백엔드 API 호출)
    return http.get('/search', { params: { q: finalQuery, limit } });
  },
};
