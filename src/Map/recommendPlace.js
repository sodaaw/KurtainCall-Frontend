// src/Map/recommendPlace.js

// 거리 계산 (Haversine 공식)
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 추천 알고리즘 - 카카오 API 데이터 기반
export const rankPlaces = (userLat, userLng, spots) => {
  // 가중치 설정
  const ratingWeight = 3.0;  // 평점 가중치 (높을수록 더 중요)
  const reviewWeight = 0.1;  // 리뷰 가중치 (높을수록 더 신뢰할 수 있음)
  const distancePenalty = 2.0;  // 거리 페널티 (높을수록 거리가 멀수록 감점)
  const reliabilityWeight = 0.5;  // 신뢰도 가중치 (리뷰수)

  return spots
    .map(p => {
      const dist = getDistance(userLat, userLng, p.lat, p.lng);
      
      // 카카오 API에서 받은 평점 정보 활용
      const rating = p.rating || 0;                    // 평점 점수 (0-5)
      const reviewCount = p.reviewCount || 0;          // 리뷰 개수
      const ratingCount = p.ratingCount || 0;          // 평점 매긴 개수
      
      // 신뢰도 계산 (리뷰수가 많을수록 신뢰도 높음)
      const reliability = Math.min(ratingCount / 10, 1); // 최대 1.0
      
      // 최종 점수 계산
      const score = (rating * ratingWeight) + 
                   (reviewCount * reviewWeight) + 
                   (reliability * reliabilityWeight) - 
                   (dist * distancePenalty);

      return { 
        ...p, 
        dist: Math.round(dist * 100) / 100, // 소수점 2자리까지
        reviewCount, 
        rating, 
        ratingCount,
        reliability: Math.round(reliability * 100) / 100,
        score: Math.round(score * 100) / 100
      };
    })
    .filter(p => p.dist <= 5.0) // 근처 5km만 확보 (너무 멀면 제외)
    .filter(p => p.rating > 0)  // 평점이 있는 장소만
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // TOP3
};

// 추천 결과를 사용자 친화적으로 포맷팅
export const formatRecommendation = (recommendedPlaces) => {
  return recommendedPlaces.map((place, index) => ({
    rank: index + 1,
    name: place.name,
    address: place.address,
    distance: `${place.dist}km`,
    rating: place.rating,
    reviewCount: place.reviewCount,
    score: place.score,
    type: place.type,
    phone: place.phone,
    detailUrl: place.detailUrl
  }));
};