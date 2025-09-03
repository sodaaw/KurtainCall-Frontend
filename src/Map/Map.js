import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import { playAPI } from '../services/api';
import './Map.css';

// @ts-ignore
import { feature } from 'topojson-client';

const Map = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // 연극 데이터 상태
  const [plays, setPlays] = useState([]);
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

  // 사용자 UI용 데이터
  const popularAreas = [
    { name: 'Daehangno', displayName: '대학로', lat: 37.5791, lng: 126.9990 },
    { name: 'Hongdae', displayName: '홍대', lat: 37.5572, lng: 126.9244 },
    { name: 'Gangnam', displayName: '강남', lat: 37.4979, lng: 127.0276 },
  ];

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체 카테고리');
  const [selectedGenre, setSelectedGenre] = useState('전체 장르');
  const [selectedRegion, setSelectedRegion] = useState('전체 지역');
  const [filteredPlays, setFilteredPlays] = useState([]);

  // 장르 목록 (Genre.jsx와 동일한 장르 사용)
  const genres = ['전체 장르', 'comedy', 'romance', 'horror', 'musical', 'drama', 'action', 'thriller'];

  // 연극 데이터 가져오기
  useEffect(() => {
    const fetchPlays = async () => {
      try {
        console.log('[Map] Fetching plays data...');
        setIsLoading(true);
        setError(null);
                 const playsData = await playAPI.getPlays();
         console.log('[Map] Plays data received:', playsData);
         console.log('[Map] Plays data type:', typeof playsData);
         console.log('[Map] Plays data length:', playsData?.length);
         if (playsData && playsData.length > 0) {
           console.log('[Map] First play sample:', playsData[0]);
           console.log('[Map] First play location:', playsData[0]?.location);
           console.log('[Map] First play address:', playsData[0]?.location?.address);
           console.log('[Map] First play coordinates:', playsData[0]?.location?.lat, playsData[0]?.location?.lng);
         }
        setPlays(playsData);
      } catch (err) {
        console.error('Failed to fetch plays:', err);
        setError(err.message || '연극 데이터를 불러오는데 실패했습니다.');
        setPlays([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlays();
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
               strokeColor: '#5C5B5C',
               strokeOpacity: 0.8,
               fillColor: '#B36B00',
               fillOpacity: 0.06,
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
          polygon.setOptions({ fillColor: '#b29ddb' });
          polygon.setOptions({fillOpacity: 0.18});
          customOverlay.setPosition(e.latLng);
          customOverlay.setMap(map);
        });
        kakao.maps.event.addListener(polygon, 'mouseout', () => {
          polygon.setOptions({ fillColor: '#CACACB' });
          polygon.setOptions({fillOpacity: 0.06});
          customOverlay.setMap(null);
        });
        kakao.maps.event.addListener(polygon, 'click', (e) => {
          const content = document.createElement('div');
          content.innerHTML = `
            <div style="padding:8px; font-size:13px;">
              <strong>${dong.properties.DONG_KOR_NM}</strong><br/>
              이 지역 맛집을 보시겠어요?<br/><br/>
              <button id="btn-goto" style="background:#B36B00;color:white;padding:4px 8px;border-radius:5px;">맛집 보기</button>
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
          strokeColor: '#004c80',
          strokeOpacity: 0.8,
          fillColor: '#ffffff',
          fillOpacity: 0.6,
        });
        regionPolygonsRef.current.push(polygon);

        kakao.maps.event.addListener(polygon, 'mouseover', (e) => {
          polygon.setOptions({ fillColor: '#d2c7ef' });
          customOverlay.setPosition(e.latLng);
          customOverlay.setMap(map);
        });
        kakao.maps.event.addListener(polygon, 'mouseout', () => {
          polygon.setOptions({ fillColor: '#ffffff' });
          customOverlay.setMap(null);
        });
        kakao.maps.event.addListener(polygon, 'click', () => {
          regionPolygonsRef.current.forEach((p) => p.setMap(null));
          regionPolygonsRef.current = [];
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
          'position:absolute;top:20px;right:40px;background:#B36B00;color:white;padding:10px 16px;border-radius:8px;z-index:100;';
        goBackButton.onclick = () => resetRegions(kakao, map, dongData, seoulMap);
        document.body.appendChild(goBackButton);
      };

      // 지역 초기화 함수
      const resetRegions = (kakao, map, dongData, seoulMap) => {
        dongPolygonsRef.current.forEach((p) => p.setMap(null));
        dongPolygonsRef.current = [];
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
    let filtered = [...plays];
    
    // 검색어로 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(play => 
        play.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        play.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        play.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 카테고리로 필터링
    if (selectedCategory !== '전체 카테고리') {
      filtered = filtered.filter(play => 
        play.category === selectedCategory
      );
    }
    
    // 장르로 필터링 (Genre.jsx와 동일한 로직 사용)
    if (selectedGenre !== '전체 장르') {
      filtered = filtered.filter(play => {
        const category = (play.category || '').toLowerCase();
        const selectedGenreLower = selectedGenre.toLowerCase();
        
        // 공포/스릴러 통합 처리 (Genre.jsx와 동일)
        if (selectedGenreLower === 'horror') {
          return category === 'horror' || category === 'thriller';
        }
        
        return category === selectedGenreLower;
      });
    }
    
    // 지역으로 필터링 (주소에 해당 지역명이 포함된 경우)
    if (selectedRegion !== '전체 지역') {
      filtered = filtered.filter(play => 
        play.location?.address?.includes(selectedRegion)
      );
    }
    
    setFilteredPlays(filtered);
    
    // 필터링된 결과가 있으면 해당 지역으로 지도 이동
    if (filtered.length > 0) {
      // 첫 번째 결과의 위치로 지도 이동
      const firstPlay = filtered[0];
      if (firstPlay.location?.lat && firstPlay.location?.lng) {
        const map = mapObjRef.current;
        if (map) {
          const position = new kakaoRef.current.maps.LatLng(
            firstPlay.location.lat, 
            firstPlay.location.lng
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
    setSelectedGenre('전체 장르');
    setSelectedRegion('전체 지역');
    setFilteredPlays([]);
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

  // 마커 갱신: plays 또는 filteredPlays가 바뀔 때마다
  useEffect(() => {
    console.log('[Map] Marker update effect triggered');
    console.log('[Map] plays data:', plays);
    console.log('[Map] plays length:', plays?.length);
    console.log('[Map] filtered plays length:', filteredPlays?.length);
    console.log('[Map] isMapReady:', isMapReady);
    
    const kakao = kakaoRef.current;
    const map = mapObjRef.current;
    const geocoder = geocoderRef.current;
    
    console.log('[Map] kakao ref:', !!kakao);
    console.log('[Map] map ref:', !!map);
    console.log('[Map] geocoder ref:', !!geocoder);
    console.log('[Map] map object details:', map);
    
    // 지도가 완전히 준비되었는지 확인
    if (!kakao || !map || !geocoder || !Array.isArray(plays) || !isMapReady) {
      console.log('[Map] Early return - missing dependencies or map not ready');
      console.log('[Map] Missing: kakao=', !kakao, 'map=', !map, 'geocoder=', !geocoder, 'plays=', !Array.isArray(plays), 'isMapReady=', !isMapReady);
      return;
    }
    
    console.log('[Map] All dependencies ready, proceeding with marker creation');

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const toLatLng = (lat, lng) => new kakao.maps.LatLng(Number(lat), Number(lng));
    
    const addMarker = (play, position) => {
      // 마커 생성
      const marker = new kakao.maps.Marker({ 
        position, 
        map,
        // 마커 스타일 개선
        zIndex: 1000
      });
      
      // 인포윈도우 내용
      const html = `
        <div style="padding:12px; min-width:250px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h4 style="margin:0 0 8px 0; color:#333; font-size:16px;">${play.title || 'Untitled'}</h4>
          <div style="font-size:13px;color:#666; margin-bottom:6px;">📍 ${play.location?.address || ''}</div>
          ${play.category ? `<div style="font-size:12px;color:#888; margin-bottom:8px;">🎭 ${play.category}</div>` : ''}
          <a href="${play.detailUrl || '#'}" target="_blank" style="display:inline-block;background:#B36B00;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">상세보기</a>
        </div>`;
      
      const infowindow = new kakao.maps.InfoWindow({ 
        content: html, 
        removable: true,
        zIndex: 1001
      });
      
      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map, marker);
      });
      
      markersRef.current.push(marker);
      console.log('[Map] Marker created for:', play.title, 'at position:', position);
    };

    const bounds = new kakao.maps.LatLngBounds();

    (async () => {
      // 필터링된 결과가 있으면 그것을 사용, 없으면 전체 plays 사용
      const playsToShow = filteredPlays.length > 0 ? filteredPlays : plays;
      console.log('[Map] Starting marker creation for', playsToShow.length, 'plays');
      console.log('[Map] Map object at marker creation:', map);
      console.log('[Map] Geocoder object at marker creation:', geocoder);
      
      try {
        console.log('[Map] Total plays to process:', playsToShow.length);
        for (const p of playsToShow) {
           console.log('[Map] Processing play:', p.title);
           const loc = p.location || {};
           console.log('[Map] Location data:', loc);
           console.log('[Map] Location type check:', {
             hasLat: loc.lat != null,
             hasLng: loc.lng != null,
             latValue: loc.lat,
             lngValue: loc.lng,
             hasAddress: !!loc.address,
             addressValue: loc.address
           });
          
                     // 좌표가 유효한 경우 (0이 아닌 값)
           if (loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0) {
             console.log('[Map] Using lat/lng:', loc.lat, loc.lng);
             try {
               const pos = toLatLng(loc.lat, loc.lng);
               addMarker(p, pos);
               bounds.extend(pos);
               console.log('[Map] Marker added with coordinates');
             } catch (markerErr) {
               console.error('[Map] Failed to create marker for coordinates:', loc.lat, loc.lng, markerErr);
             }
           } 
           // 주소가 있는 경우 지오코딩
           else if (loc.address && loc.address.trim()) {
             console.log('[Map] Geocoding address:', loc.address);
             try {
               const pos = await new Promise(resolve => {
                 geocoder.addressSearch(loc.address, (result, status) => {
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
                 addMarker(p, pos);
                 bounds.extend(pos);
                 console.log('[Map] Marker added with geocoded position');
               } else {
                 console.log('[Map] Geocoding failed for:', loc.address);
               }
             } catch (geocodeErr) {
               console.error('[Map] Geocoding error for address:', loc.address, geocodeErr);
             }
           } 
           // 위치 정보가 없는 경우
           else {
             console.log('[Map] No valid location data for:', p.title, 'location:', loc);
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
     }, [plays, filteredPlays, isMapReady]);

  // 디버깅용 렌더링 확인
  console.log('[Map] Component rendering, plays:', plays?.length, 'isMapReady:', isMapReady);

  return (
    <div className="map-page">
      <Topnav />

      <div className="map-header-text">
        <h2>공연 지도</h2>
        <p>공연 정보를 조회할 지역을 선택하세요.</p>
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
            placeholder="장소 또는 공연을 검색해 보세요" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>전체 카테고리</option>
            <option>뮤지컬</option>
            <option>연극</option>
          </select>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genres.map((genre, index) => {
              // 장르별 한글 표시명 매핑
              const genreLabels = {
                '전체 장르': '전체 장르',
                'comedy': '코미디',
                'romance': '로맨스',
                'horror': '공포/스릴러',
                'musical': '뮤지컬',
                'drama': '드라마',
                'action': '액션',
                'thriller': '스릴러'
              };
              return (
                <option key={index} value={genre}>
                  {genreLabels[genre] || genre}
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

          <div className="popular-areas">
            <h4>인기 지역</h4>
            <ul>
              {popularAreas.map((area, i) => (
                <li 
                  key={i} 
                  onClick={() => focusOnArea(area)}
                  style={{ cursor: 'pointer', padding: '8px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📍 {area.displayName}
                </li>
              ))}
            </ul>
          </div>
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
      {filteredPlays.length > 0 && (
        <section className="filter-results">
          <h4>검색 결과 ({filteredPlays.length}개)</h4>
          <div className="experience-list">
            {filteredPlays.map((play, index) => (
              <div key={play._id || index} className="exp-card">
                                  <div className="exp-info">
                    <h5>{play.title}</h5>
                    <p>{play.location?.address || '주소 정보 없음'}</p>
                    {play.category && <p className="category">🎭 {play.category}</p>}
                  </div>
                <a 
                  href={play.detailUrl || '#'} 
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
      {filteredPlays.length === 0 && (
        <div className="no-filter-message">
          <p>검색 조건을 설정하고 "필터 적용하기"를 클릭하여 공연을 찾아보세요.</p>
        </div>
      )}
    </div>
  );
};

export default Map;