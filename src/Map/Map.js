import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import { playAPI } from '../services/api';
// import { festivals } from '../data/festivals'; // 축제 데이터는 나중에 제거
import './Map.css';

// @ts-ignore
import { feature } from 'topojson-client';

// 카카오 api 응답 -> map.js에서 사용할 데이터 구조로 변환
const transformKakaoData = (kakaoResponse) => {
  return kakaoResponse.documents.map(place => ({
    id: place.id,
    name: place.place_name,
    type: 'theater', // 일단 카테고리 매핑은 단순화
    address: place.address_name,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
    description: place.category_name,
    hours: '운영시간 정보 없음',
    tags: [place.category_group_code],
    detailUrl: place.place_url || '#',
    phone: place.phone || '',
    roadAddress: place.road_address_name || ''
  }))
};

// api 호출로 문화시설 가져오기
const fetchCultureSpotsFromKakao = async (query, lat, lng, radius = 5000) => {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?` +
      `query=${encodeURIComponent(query)}&x=${lng}&y=${lat}&radius=${radius}&size=15&sort=distance`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_API_KEY}`
        }
      }
    );
    const data = await response.json();
    return transformKakaoData(data);

  } catch (error) {
    console.error('카카오 Places API 호출 실패:', error);
    return [];
  }
};

const Map = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // 문화시설 데이터 상태
  const [cultureSpots, setCultureSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kakao Maps 관련 refs
  const kakaoRef = useRef(null);
  const mapObjRef = useRef(null);
  const geocoderRef = useRef(null);
  const markersRef = useRef([]);
  const regionPolygonsRef = useRef([]);
  const dongPolygonsRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // 인기 문화지역 데이터
  const popularAreas = [
    { name: 'Daehangno', displayName: '대학로', lat: 37.5791, lng: 126.9990, type: 'theater' },
    { name: 'Hongdae', displayName: '홍대', lat: 37.5572, lng: 126.9244, type: 'gallery' },
    { name: 'Gangnam', displayName: '강남', lat: 37.4979, lng: 127.0276, type: 'museum' },
    { name: 'Insadong', displayName: '인사동', lat: 37.5735, lng: 126.9858, type: 'gallery' },
    { name: 'Samcheongdong', displayName: '삼청동', lat: 37.5847, lng: 126.9807, type: 'museum' },
  ];

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체 카테고리');
  const [selectedType, setSelectedType] = useState('전체 유형');
  const [selectedRegion, setSelectedRegion] = useState('전체 지역');
  const [filteredSpots, setFilteredSpots] = useState([]);

  // 문화시설 유형 목록
  const cultureTypes = ['전체 유형', 'theater', 'museum', 'gallery', 'exhibition', 'concert'];

  // 문화시설 데이터 가져오기 (임시 샘플 데이터)
  useEffect(() => {
    const fetchCultureSpots = async () => {
      try {
        console.log('[Map] Fetching culture spots data...');
        setIsLoading(true);
        setError(null);
        
        // 임시 샘플 데이터 (나중에 카카오 Places API로 교체)
        const sampleSpots = [
          {
            id: 1,
            name: '국립중앙박물관',
            type: 'museum',
            address: '서울 용산구 서빙고로 137',
            lat: 37.5240,
            lng: 126.9803,
            description: '한국의 역사와 문화를 한눈에 볼 수 있는 국립중앙박물관',
            hours: '09:00-18:00',
            tags: ['역사', '문화', '교육']
          },
          {
            id: 2,
            name: '서울시립미술관',
            type: 'gallery',
            address: '서울 중구 덕수궁길 61',
            lat: 37.5658,
            lng: 126.9750,
            description: '현대미술의 중심지, 서울시립미술관',
            hours: '10:00-20:00',
            tags: ['현대미술', '전시', '예술']
          },
          {
            id: 3,
            name: '세종문화회관',
            type: 'theater',
            address: '서울 종로구 세종대로 175',
            lat: 37.5725,
            lng: 126.9754,
            description: '클래식과 오페라의 성지, 세종문화회관',
            hours: '09:00-22:00',
            tags: ['클래식', '오페라', '공연']
          }
        ];
        
        console.log('[Map] Sample culture spots:', sampleSpots);
        setCultureSpots(sampleSpots);
      } catch (err) {
        console.error('Failed to fetch culture spots:', err);
        setError(err.message || '문화시설 데이터를 불러오는데 실패했습니다.');
        setCultureSpots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCultureSpots();
  }, []);

  // Kakao SDK 로딩 함수
  const loadKakao = () =>
    new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) return resolve(window.kakao);

      const exist = document.querySelector('script[data-kakao="true"]');
      if (!exist) {
        const s = document.createElement('script');
        s.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=039270177862ec2c7c46e905b6d3352f&autoload=false&libraries=services';
        s.async = true;
        s.dataset.kakao = 'true';
        s.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'));
        document.head.appendChild(s);
      }

      const onReady = () => window.kakao.maps.load(() => resolve(window.kakao));
      // 이미 붙어있으면 onload만 걸고, 없으면 위에서 붙인 스크립트가 load되면 호출
      (exist || document.querySelector('script[data-kakao="true"]')).addEventListener('load', onReady, { once: true });
    });

  // 지도 초기화: 최초 1회
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        console.log('[Map] Starting map initialization...');
        const kakao = await loadKakao();
        if (!mounted || !mapRef.current) return;

        console.log('[Map] Kakao SDK loaded, creating map...');
        kakaoRef.current = kakao;
        mapObjRef.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.978),
          level: 9,
        });
        geocoderRef.current = new kakao.maps.services.Geocoder();

        console.log('[Map] Map initialized successfully');
        console.log('[Map] Map object:', mapObjRef.current);
        console.log('[Map] Geocoder object:', geocoderRef.current);

        // 지도가 완전히 로드될 때까지 대기 (더 안정적인 방법)
        await new Promise(resolve => {
          const checkMapReady = () => {
            if (mapObjRef.current && mapObjRef.current.getCenter && mapObjRef.current.getLevel) {
              console.log('[Map] Map is fully ready, setting isMapReady to true');
              setIsMapReady(true);
              resolve();
            } else {
              console.log('[Map] Map not ready yet, retrying...');
              setTimeout(checkMapReady, 100);
            }
          };
          checkMapReady();
        });
        
        // 서울 지도 데이터 로딩 및 구/동 폴리곤 그리기
        console.log('[Map] Starting Seoul map initialization...');
        try {
          await initializeSeoulMap(kakao);
          console.log('[Map] Seoul map initialization completed');
        } catch (seoulErr) {
          console.error('[Map] Seoul map initialization failed:', seoulErr);
          console.log('[Map] Continuing with basic map display...');
          // 서울 지도 초기화 실패 시에도 기본 지도는 계속 표시
        }
      } catch (err) {
        console.error('Map init error:', err);
      }
    })().catch(err => console.error('Map init error:', err));

    return () => { mounted = false; };
  }, []);

  // 서울 지도 초기화 함수
  const initializeSeoulMap = async (kakao) => {
    try {
      console.log('[Map] Loading Seoul map data...');
      
      // 지도 데이터 로딩
      const [seoulMap, dongDataRaw] = await Promise.all([
        fetch('/seoul.geojson').then(res => {
          if (!res.ok) throw new Error(`Failed to load seoul.geojson: ${res.status}`);
          return res.json();
        }),
        fetch('/seoul_districts_topo.json').then(res => {
          if (!res.ok) throw new Error(`Failed to load seoul_districts_topo.json: ${res.status}`);
          return res.json();
        })
      ]);

      console.log('[Map] Seoul map data loaded successfully');
      console.log('[Map] Seoul map features:', seoulMap?.features?.length);
      console.log('[Map] Dong data features:', dongDataRaw?.objects?.admdong_seoul_codeEdit_1?.geometries?.length);

      const dongData = feature(dongDataRaw, dongDataRaw.objects.admdong_seoul_codeEdit_1);
      const map = mapObjRef.current;

      // 데이터 유효성 검증
      if (!seoulMap?.features || !dongData?.features) {
        console.error('[Map] Invalid map data structure');
        throw new Error('Invalid map data structure');
      }

      console.log('[Map] Creating map overlays...');
      const customOverlay = new kakao.maps.CustomOverlay({});
      const infowindow = new kakao.maps.InfoWindow({ removable: true });

      // popularAreas에서 좌표 정보 가져오기
      const centers = popularAreas;

      // 동 지역 표시 함수
      const displayDongAreas = (dongGeo) => {
        dongGeo.forEach((dong) => {
          const geometry = dong.geometry;
          const drawPolygon = (coords) => {
            const path = coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
                         const polygon = new kakao.maps.Polygon({
               map,
               path,
               strokeWeight: 2,
              strokeColor: '#26667F',
              strokeOpacity: 0.8,
              fillColor: '#67C090',
              fillOpacity: 0.08,
             });
            dongPolygonsRef.current.push(polygon);
            addDongEvents(polygon, dong, kakao, map, infowindow, customOverlay);
          };

          if (geometry.type === 'Polygon') drawPolygon(geometry.coordinates[0]);
          else if (geometry.type === 'MultiPolygon')
            geometry.coordinates.forEach((multi) => drawPolygon(multi[0]));
        });
      };

      // 동 지역 이벤트 추가
      const addDongEvents = (polygon, dong, kakao, map, infowindow, customOverlay) => {
        kakao.maps.event.addListener(polygon, 'mouseover', (e) => {
          polygon.setOptions({ fillColor: '#7dd3a3' });
          polygon.setOptions({fillOpacity: 0.2});
          customOverlay.setPosition(e.latLng);
          customOverlay.setMap(map);
        });
        kakao.maps.event.addListener(polygon, 'mouseout', () => {
          polygon.setOptions({ fillColor: '#67C090' });
          polygon.setOptions({fillOpacity: 0.08});
          customOverlay.setMap(null);
        });
        kakao.maps.event.addListener(polygon, 'click', (e) => {
          const content = document.createElement('div');
          content.innerHTML = `
            <div style="padding:8px; font-size:13px;">
              <strong>${dong.properties.DONG_KOR_NM}</strong><br/>
              이 지역 맛집을 보시겠어요?<br/><br/>
              <button id="btn-goto" style="background:#67C090;color:white;padding:4px 8px;border-radius:5px;border:none;font-weight:600;">맛집 보기</button>
            </div>`;
          infowindow.setContent(content);
          infowindow.setPosition(e.latLng);
          infowindow.setMap(map);
          content.querySelector('#btn-goto')?.addEventListener('click', () => {
            navigate('/restaurant');
          });
          addGoBackButton(kakao, map, dongData, seoulMap, centers);
        });
      };

      // 구 지역 표시 함수
      const displayArea = (coords, name) => {
        const path = coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
        const polygon = new kakao.maps.Polygon({
          map,
          path,
          strokeWeight: 2,
          strokeColor: '#26667F',
          strokeOpacity: 0.8,
          fillColor: '#DDF4E7',
          fillOpacity: 0.7,
        });
        regionPolygonsRef.current.push(polygon);

        kakao.maps.event.addListener(polygon, 'mouseover', (e) => {
          polygon.setOptions({ fillColor: '#7dd3a3' });
          customOverlay.setPosition(e.latLng);
          customOverlay.setMap(map);
        });
        kakao.maps.event.addListener(polygon, 'mouseout', () => {
          polygon.setOptions({ fillColor: '#DDF4E7' });
          customOverlay.setMap(null);
        });
        kakao.maps.event.addListener(polygon, 'click', () => {
          // 구 테두리는 유지하고 동 레벨로만 확대
          const center = centers.find((c) => c.name === name);
          if (center)
            map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
          map.setLevel(7);
          const dongs = dongData.features.filter(
            (f) => f.properties.SIG_KOR_NM === name,
          );
          displayDongAreas(dongs);
          addGoBackButton(kakao, map, dongData, seoulMap, centers);
        });
      };

      // 뒤로가기 버튼 추가
      const addGoBackButton = (kakao, map, dongData, seoulMap, centers) => {
        let goBackButton = document.querySelector('#go-back-btn');
        if (goBackButton) return;
        
        goBackButton = document.createElement('button');
        goBackButton.id = 'go-back-btn';
        goBackButton.innerText = '구 다시 선택하기';
        goBackButton.style.cssText =
          'position:absolute;top:20px;right:40px;background:#67C090;color:white;padding:10px 16px;border-radius:8px;z-index:100;border:none;font-weight:600;box-shadow:0 4px 12px rgba(103, 192, 144, 0.3);';
        goBackButton.onclick = () => resetRegions(kakao, map, dongData, seoulMap);
        document.body.appendChild(goBackButton);
      };

      // 지역 초기화 함수
      const resetRegions = (kakao, map, dongData, seoulMap) => {
        // 동 폴리곤 제거
        dongPolygonsRef.current.forEach((p) => p.setMap(null));
        dongPolygonsRef.current = [];
        
        // 구 폴리곤 다시 표시 (기존 폴리곤들을 다시 활성화)
        regionPolygonsRef.current.forEach((p) => p.setMap(map));
        
        infowindow.close();
        map.setLevel(9);
        map.setCenter(new kakao.maps.LatLng(37.5665, 126.9780));
        
        const goBackButton = document.querySelector('#go-back-btn');
        if (goBackButton) {
          goBackButton.remove();
        }
        
        seoulMap.features.forEach((f) => {
          displayArea(f.geometry.coordinates[0], f.properties.SIG_KOR_NM);
        });
      };

      // 초기 구 지역 표시
      seoulMap.features.forEach((f) => {
        displayArea(f.geometry.coordinates[0], f.properties.SIG_KOR_NM);
      });

    } catch (err) {
      console.error('Seoul map initialization error:', err);
    }
  };

  // 검색 및 필터링 함수
  const applyFilters = () => {
    let filtered = [...cultureSpots];
    
    // 검색어로 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(spot => 
        spot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 카테고리로 필터링
    if (selectedCategory !== '전체 카테고리') {
      filtered = filtered.filter(spot => 
        spot.category === selectedCategory
      );
    }
    
    // 문화시설 유형으로 필터링
    if (selectedType !== '전체 유형') {
      filtered = filtered.filter(spot => 
        spot.type === selectedType
      );
    }
    
    // 지역으로 필터링 (주소에 해당 지역명이 포함된 경우)
    if (selectedRegion !== '전체 지역') {
      filtered = filtered.filter(spot => 
        spot.address?.includes(selectedRegion)
      );
    }
    
    setFilteredSpots(filtered);
    
    // 필터링된 결과가 있으면 해당 지역으로 지도 이동
    if (filtered.length > 0) {
      // 첫 번째 결과의 위치로 지도 이동
      const firstSpot = filtered[0];
      if (firstSpot.lat && firstSpot.lng) {
        const map = mapObjRef.current;
        if (map) {
          const position = new kakaoRef.current.maps.LatLng(
            firstSpot.lat, 
            firstSpot.lng
          );
          map.setCenter(position);
          map.setLevel(7);
        }
      }
    }
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('전체 카테고리');
    setSelectedType('전체 유형');
    setSelectedRegion('전체 지역');
    setFilteredSpots([]);
  };

  // 인기지역 클릭 시 해당 지역으로 지도 이동
  const focusOnArea = (area) => {
    if (!mapObjRef.current) return;
    
    const map = mapObjRef.current;
    const position = new kakaoRef.current.maps.LatLng(area.lat, area.lng);
    
    // 지도 중심을 해당 지역으로 이동
    map.setCenter(position);
    // 적절한 줌 레벨로 설정
    map.setLevel(6);
    
    // 해당 지역에 마커 추가 (선택된 지역 표시)
    const marker = new kakaoRef.current.maps.Marker({
      position: position,
      map: map,
      zIndex: 2000
    });
    
    // 3초 후 마커 제거
    setTimeout(() => {
      marker.setMap(null);
    }, 3000);
  };

  // 마커 갱신: cultureSpots 또는 filteredSpots가 바뀔 때마다
  useEffect(() => {
    console.log('[Map] Marker update effect triggered');
    console.log('[Map] cultureSpots data:', cultureSpots);
    console.log('[Map] cultureSpots length:', cultureSpots?.length);
    console.log('[Map] filtered spots length:', filteredSpots?.length);
    console.log('[Map] isMapReady:', isMapReady);
    
    const kakao = kakaoRef.current;
    const map = mapObjRef.current;
    const geocoder = geocoderRef.current;
    
    console.log('[Map] kakao ref:', !!kakao);
    console.log('[Map] map ref:', !!map);
    console.log('[Map] geocoder ref:', !!geocoder);
    console.log('[Map] map object details:', map);
    
    // 지도가 완전히 준비되었는지 확인
    if (!kakao || !map || !geocoder || !Array.isArray(cultureSpots) || !isMapReady) {
      console.log('[Map] Early return - missing dependencies or map not ready');
      console.log('[Map] Missing: kakao=', !kakao, 'map=', !map, 'geocoder=', !geocoder, 'cultureSpots=', !Array.isArray(cultureSpots), 'isMapReady=', !isMapReady);
      return;
    }
    
    console.log('[Map] All dependencies ready, proceeding with marker creation');

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const toLatLng = (lat, lng) => new kakao.maps.LatLng(Number(lat), Number(lng));
    
    const addMarker = (spot, position) => {
      // 마커 생성
      const marker = new kakao.maps.Marker({ 
        position, 
        map,
        // 마커 스타일 개선
        zIndex: 1000
      });
      
      // 문화시설 유형별 아이콘
      const getTypeIcon = (type) => {
        switch(type) {
          case 'theater': return '🎭';
          case 'museum': return '🏛️';
          case 'gallery': return '🖼️';
          case 'exhibition': return '🎨';
          case 'concert': return '🎵';
          default: return '📍';
        }
      };
      
      // 인포윈도우 내용
      const html = `
        <div style="padding:12px; min-width:250px; background:linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:1px solid #67C090;">
          <h4 style="margin:0 0 8px 0; color:#67C090; font-size:16px; font-weight:600;">${getTypeIcon(spot.type)} ${spot.name || 'Untitled'}</h4>
          <div style="font-size:13px;color:#DDF4E7; margin-bottom:6px;">📍 ${spot.address || ''}</div>
          ${spot.hours ? `<div style="font-size:12px;color:#7dd3a3; margin-bottom:6px;">🕒 ${spot.hours}</div>` : ''}
          ${spot.type ? `<div style="font-size:12px;color:#7dd3a3; margin-bottom:8px;">${getTypeIcon(spot.type)} ${spot.type}</div>` : ''}
          <a href="#" style="display:inline-block;background:#67C090;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;border:none;box-shadow:0 2px 8px rgba(103, 192, 144, 0.3);">상세보기</a>
        </div>`;
      
      const infowindow = new kakao.maps.InfoWindow({ 
        content: html, 
        removable: true,
        zIndex: 1001
      });
      
      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        // 기존에 열려있는 모든 인포윈도우 닫기
        markersRef.current.forEach(m => {
          if (m.infowindow) {
            m.infowindow.close();
          }
        });
        
        // 현재 마커의 인포윈도우 열기
        infowindow.open(map, marker);
        
        // 마커에 인포윈도우 참조 저장
        marker.infowindow = infowindow;
      });
      
      markersRef.current.push(marker);
      console.log('[Map] Marker created for:', spot.name, 'at position:', position);
    };

    const bounds = new kakao.maps.LatLngBounds();

    (async () => {
      // 필터링된 결과가 있으면 그것을 사용, 없으면 전체 cultureSpots 사용
      const spotsToShow = filteredSpots.length > 0 ? filteredSpots : cultureSpots;
      console.log('[Map] Starting marker creation for', spotsToShow.length, 'culture spots');
      console.log('[Map] Map object at marker creation:', map);
      console.log('[Map] Geocoder object at marker creation:', geocoder);
      
      try {
        console.log('[Map] Total culture spots to process:', spotsToShow.length);
        for (const spot of spotsToShow) {
           console.log('[Map] Processing culture spot:', spot.name);
           console.log('[Map] Location data:', {
             lat: spot.lat,
             lng: spot.lng,
             address: spot.address
           });
           console.log('[Map] Location type check:', {
             hasLat: spot.lat != null,
             hasLng: spot.lng != null,
             latValue: spot.lat,
             lngValue: spot.lng,
             hasAddress: !!spot.address,
             addressValue: spot.address
           });
          
           // 좌표가 유효한 경우 (0이 아닌 값)
           if (spot.lat && spot.lng && spot.lat !== 0 && spot.lng !== 0) {
             console.log('[Map] Using lat/lng:', spot.lat, spot.lng);
             try {
               const pos = toLatLng(spot.lat, spot.lng);
               addMarker(spot, pos);
               bounds.extend(pos);
               console.log('[Map] Marker added with coordinates');
             } catch (markerErr) {
               console.error('[Map] Failed to create marker for coordinates:', spot.lat, spot.lng, markerErr);
             }
           } 
           // 주소가 있는 경우 지오코딩
           else if (spot.address && spot.address.trim()) {
             console.log('[Map] Geocoding address:', spot.address);
             try {
               const pos = await new Promise(resolve => {
                 geocoder.addressSearch(spot.address, (result, status) => {
                   console.log('[Map] Geocoding result:', status, result);
                   if (status === kakao.maps.services.Status.OK && result[0]) {
                     resolve(toLatLng(result[0].y, result[0].x)); // y=lat, x=lng
                   } else {
                     console.log('[Map] Geocoding failed, status:', status);
                     resolve(null);
                   }
                 });
               });
               if (pos) {
                 addMarker(spot, pos);
                 bounds.extend(pos);
                 console.log('[Map] Marker added with geocoded position');
               } else {
                 console.log('[Map] Geocoding failed for:', spot.address);
               }
             } catch (geocodeErr) {
               console.error('[Map] Geocoding error for address:', spot.address, geocodeErr);
             }
           } 
           // 위치 정보가 없는 경우
           else {
             console.log('[Map] No valid location data for:', spot.name, 'location:', spot.address);
           }
        }
        
                 console.log('[Map] Total markers created:', markersRef.current.length);
         
         // 디버깅용: 테스트 마커 추가 (서울 시청)
         if (markersRef.current.length === 0) {
           console.log('[Map] No markers created, adding test marker at Seoul City Hall');
           const testPosition = new kakao.maps.LatLng(37.5665, 126.978);
           const testMarker = new kakao.maps.Marker({ 
             position: testPosition, 
             map,
             zIndex: 1000
           });
           markersRef.current.push(testMarker);
           bounds.extend(testPosition);
           console.log('[Map] Test marker added');
         }
         
         if (!bounds.isEmpty()) {
           map.setBounds(bounds);
           console.log('[Map] Map bounds updated');
         }
      } catch (err) {
        console.error('[Map] Error during marker creation:', err);
      }
    })();
     }, [cultureSpots, filteredSpots, isMapReady]);

  // 디버깅용 렌더링 확인
  console.log('[Map] Component rendering, cultureSpots:', cultureSpots?.length, 'isMapReady:', isMapReady);

  return (
    <div className="map-page">
      <Topnav />

      <div className="map-header-text">
        <h2>문화시설 지도</h2>
        <p>근처 문화시설(극장/미술관/박물관)을 찾아보세요.</p>
        {/* 디버깅용 상태 표시 */}
        {/* <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
          Debug: Plays: {plays?.length || 0}, Map Ready: {isMapReady ? 'Yes' : 'No'}
        </div> */}
      </div>

      <div className="map-content">
        <aside className="map-filter">
          <h4>검색 및 필터</h4>
          <input 
            type="text" 
            placeholder="문화시설명 또는 지역을 검색해 보세요" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>전체 카테고리</option>
            <option>공연</option>
            <option>전시</option>
            <option>교육</option>
          </select>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {cultureTypes.map((type, index) => {
              // 문화시설 유형별 한글 표시명 매핑
              const typeLabels = {
                '전체 유형': '전체 유형',
                'theater': '극장',
                'museum': '박물관',
                'gallery': '미술관',
                'exhibition': '전시회',
                'concert': '콘서트홀'
              };
              return (
                <option key={index} value={type}>
                  {typeLabels[type] || type}
                </option>
              );
            })}
          </select>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option>전체 지역</option>
            <option>서울</option>
            <option>인천</option>
          </select>
          <div className="filter-buttons">
            <button className="apply-btn" onClick={applyFilters}>
              필터 적용하기
            </button>
            <button className="reset-btn" onClick={resetFilters}>
              초기화
            </button>
          </div>

          {/* <div className="popular-areas">
            <h4>인기 지역</h4>
            <ul>
              {popularAreas.map((area, i) => (
                <li 
                  key={i} 
                  onClick={() => focusOnArea(area)}
                  style={{ cursor: 'pointer', padding: '8px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(103, 192, 144, 0.15)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📍 {area.displayName}
                </li>
              ))}
            </ul>
          </div> */}
        </aside>

        <div className="map-container-wrapper">
          <div ref={mapRef} className="map-container" />
          {!isMapReady && (
            <div className="map-loading-overlay">
              <div className="map-loading-spinner">지도를 불러오는 중...</div>
            </div>
          )}
        </div>
      </div>

      {/* 필터 결과 표시 (필터를 적용했을 때만 표시) */}
      {filteredSpots.length > 0 && (
        <section className="filter-results">
          <h4>검색 결과 ({filteredSpots.length}개)</h4>
          <div className="experience-list">
            {filteredSpots.map((spot, index) => (
              <div key={spot.id || index} className="exp-card">
                <div className="exp-info">
                  <h5>{spot.name}</h5>
                  <p>{spot.address || '주소 정보 없음'}</p>
                  {spot.type && (
                    <p className="category">
                      {spot.type === 'theater' && '🎭 극장'}
                      {spot.type === 'museum' && '🏛️ 박물관'}
                      {spot.type === 'gallery' && '🖼️ 미술관'}
                      {spot.type === 'exhibition' && '🎨 전시회'}
                      {spot.type === 'concert' && '🎵 콘서트홀'}
                    </p>
                  )}
                  {spot.hours && <p className="hours">🕒 {spot.hours}</p>}
                </div>
                <a 
                  href={spot.detailUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-btn"
                >
                  상세보기
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 필터를 적용하지 않았을 때는 아무것도 표시하지 않음 */}
      {filteredSpots.length === 0 && (
        <div className="no-filter-message">
          <p>검색 조건을 설정하고 "필터 적용하기"를 클릭하여 문화시설을 찾아보세요.</p>
        </div>
      )}
    </div>
  );
};

export default Map;