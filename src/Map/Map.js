import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import './Map.css';

// @ts-ignore
import { feature } from 'topojson-client';

const Map = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // 사용자 UI용 데이터
  const popularAreas = ['Gangnam', 'Hongdae', 'Myeongdong', 'Insadong'];
  const foundExperiences = [
    { id: 1, name: 'FI Formular', location: 'Seoul / Itaewon', rating: 4.8 },
    { id: 2, name: 'Art Market', location: 'Seong‑su', rating: 4.5 },
    { id: 3, name: 'Jazz Night', location: 'Itaewon', rating: 4.6 },
    { id: 4, name: 'Modern Art Tour', location: 'Seoul City Museum', rating: 4.7 },
  ];

  useEffect(() => {
    const loadScript = () =>
      new Promise((resolve, reject) => {
        // 이미 로드된 스크립트가 있는지 확인
        if (window.kakao && window.kakao.maps) {
          return resolve();
        }
        
        const existing = document.querySelector('script[src^="https://dapi.kakao.com"]');
        if (existing) {
          // 기존 스크립트가 있지만 아직 로드되지 않은 경우
          const checkKakao = () => {
            if (window.kakao && window.kakao.maps) {
              resolve();
            } else {
              setTimeout(checkKakao, 100);
            }
          };
          checkKakao();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=039270177862ec2c7c46e905b6d3352f&autoload=false';
        script.async = true;
        script.onload = () => {
          // 스크립트 로드 후 kakao 객체가 준비될 때까지 대기
          const checkKakao = () => {
            if (window.kakao && window.kakao.maps) {
              resolve();
            } else {
              setTimeout(checkKakao, 100);
            }
          };
          checkKakao();
        };
        script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'));
        document.head.appendChild(script);
      });

    let goBackButton = null;

    const initializeMap = async () => {
      try {
        await loadScript();
        
        // Kakao Maps SDK가 로드되었는지 확인
        if (typeof window.kakao === 'undefined' || !window.kakao.maps) {
          throw new Error('Kakao Maps SDK failed to load properly.');
        }

        // Load Kakao Maps with timeout
        try {
          await Promise.race([
            window.kakao.maps.load(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Kakao Maps load timeout')), 10000)
            )
          ]);
        } catch (loadError) {
          throw new Error(`Failed to initialize Kakao Maps: ${loadError.message}`);
        }
        
        if (!mapRef.current) return;

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 9,
        });

        // 지도 데이터 로딩
        const [seoulMap, dongDataRaw] = await Promise.all([
          fetch('/seoul.geojson').then(res => res.json()),
          fetch('/seoul_districts_topo.json').then(res => res.json())
        ]);

        const dongData = feature(dongDataRaw, dongDataRaw.objects.admdong_seoul_codeEdit_1);

        const customOverlay = new window.kakao.maps.CustomOverlay({});
        const infowindow = new window.kakao.maps.InfoWindow({ removable: true });

        const centers = [
          { name: 'Gangnam', lat: 37.4979, lng: 127.0276 },
          { name: 'Hongdae', lat: 37.5572, lng: 126.9244 },
          { name: 'Myeongdong', lat: 37.5636, lng: 126.982 },
          { name: 'Insadong', lat: 37.5740, lng: 126.9850 },
        ];

        let regionPolygons = [];
        let dongPolygons = [];

        const displayDongAreas = (dongGeo) => {
          dongGeo.forEach((dong) => {
            const geometry = dong.geometry;
            const drawPolygon = (coords) => {
              const path = coords.map(([lng, lat]) => new window.kakao.maps.LatLng(lat, lng));
              const polygon = new window.kakao.maps.Polygon({
                map,
                path,
                strokeWeight: 2,
                strokeColor: '#5C5B5C',
                strokeOpacity: 0.8,
                fillColor: '#CACACB',
                fillOpacity: 0.7,
              });
              dongPolygons.push(polygon);
              addDongEvents(polygon, dong);
            };

            if (geometry.type === 'Polygon') drawPolygon(geometry.coordinates[0]);
            else if (geometry.type === 'MultiPolygon')
              geometry.coordinates.forEach((multi) => drawPolygon(multi[0]));
          });
        };

        const addDongEvents = (polygon, dong) => {
          window.kakao.maps.event.addListener(polygon, 'mouseover', (e) => {
            polygon.setOptions({ fillColor: '#b29ddb' });
            customOverlay.setPosition(e.latLng);
            customOverlay.setMap(map);
          });
          window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
            polygon.setOptions({ fillColor: '#CACACB' });
            customOverlay.setMap(null);
          });
          window.kakao.maps.event.addListener(polygon, 'click', (e) => {
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
            addGoBackButton();
          });
        };

        const displayArea = (coords, name) => {
          const path = coords.map(([lng, lat]) => new window.kakao.maps.LatLng(lat, lng));
          const polygon = new window.kakao.maps.Polygon({
            map,
            path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
            fillColor: '#ffffff',
            fillOpacity: 0.6,
          });
          regionPolygons.push(polygon);

          window.kakao.maps.event.addListener(polygon, 'mouseover', (e) => {
            polygon.setOptions({ fillColor: '#d2c7ef' });
            customOverlay.setPosition(e.latLng);
            customOverlay.setMap(map);
          });
          window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
            polygon.setOptions({ fillColor: '#ffffff' });
            customOverlay.setMap(null);
          });
          window.kakao.maps.event.addListener(polygon, 'click', () => {
            regionPolygons.forEach((p) => p.setMap(null));
            regionPolygons = [];
            const center = centers.find((c) => c.name === name);
            if (center)
              map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
            map.setLevel(7);
            const dongs = dongData.features.filter(
              (f) => f.properties.SIG_KOR_NM === name,
            );
            displayDongAreas(dongs);
            addGoBackButton();
          });
        };

        const addGoBackButton = () => {
          if (goBackButton) return;
          goBackButton = document.createElement('button');
          goBackButton.innerText = '구 다시 선택하기';
          goBackButton.style.cssText =
            'position:absolute;top:20px;right:40px;background:#B36B00;color:white;padding:10px 16px;border-radius:8px;z-index:100;';
          goBackButton.onclick = () => resetRegions();
          document.body.appendChild(goBackButton);
        };

        const resetRegions = () => {
          dongPolygons.forEach((p) => p.setMap(null));
          dongPolygons = [];
          infowindow.close();
          map.setLevel(9);
          map.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
          if (goBackButton) {
            goBackButton.remove();
            goBackButton = null;
          }
          seoulMap.features.forEach((f) => {
            displayArea(f.geometry.coordinates[0], f.properties.SIG_KOR_NM);
          });
        };

        seoulMap.features.forEach((f) => {
          displayArea(f.geometry.coordinates[0], f.properties.SIG_KOR_NM);
        });
        
      } catch (err) {
        console.error('Map initialization error:', err);
        // 에러가 발생해도 지도는 표시되도록 함
      }
    };

    initializeMap();

    return () => {
      if (goBackButton) goBackButton.remove();
    };
  }, [navigate]);

  return (
    <div className="map-page">
      <Topnav />

      <div className="map-header-text">
        <h2>Map 실험</h2>
        <p>Select the desired district in Seoul.</p>
      </div>

      <div className="map-content">
        <aside className="map-filter">
          <h4>Search & Filter</h4>
          <input type="text" placeholder="Search experiences or location..." />
          <select>
            <option>All Categories</option>
            <option>Musical</option>
            <option>Play</option>
            <option>Exhibition</option>
          </select>
          <select>
            <option>All Locations</option>
            <option>Seoul</option>
            <option>Incheon</option>
          </select>
          <button className="apply-btn">Apply Filters</button>

          <div className="popular-areas">
            <h4>Popular Areas</h4>
            <ul>
              {popularAreas.map((a, i) => (
                <li key={i}>📍 {a}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="map-container-wrapper">
          <div ref={mapRef} className="map-container" />
        </div>
      </div>

      <section className="found-experiences">
        <h4>Found Experiences</h4>
        <div className="experience-list">
          {foundExperiences.map((e) => (
            <div key={e.id} className="exp-card">
              <div className="exp-info">
                <h5>{e.name}</h5>
                <p>{e.location}</p>
              </div>
              <span className="exp-rating">★ {e.rating}</span>
              <button className="view-btn">View Details</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Map;