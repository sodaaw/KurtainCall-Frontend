import React, { useState, useEffect, useRef } from "react";
import "./Community.css";

const LocationModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerRef = useRef(null);

  // Kakao Maps SDK 로딩
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
      (exist || document.querySelector('script[data-kakao="true"]')).addEventListener('load', onReady, { once: true });
    });

  // 지도 초기화
  useEffect(() => {
    if (!isOpen) return;

    const initMap = async () => {
      try {
        const kakao = await loadKakao();
        mapObjRef.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
          level: 8,
        });
        setMapReady(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();
  }, [isOpen]);

  // 장소 검색
  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const kakao = window.kakao;
      const places = new kakao.maps.services.Places();
      
      places.keywordSearch(searchQuery, (results, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setSearchResults(results.slice(0, 10)); // 상위 10개 결과만
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
    }
  };

  // 검색 결과 클릭
  const handleResultClick = (place) => {
    setSelectedLocation({
      name: place.place_name,
      address: place.address_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x)
    });

    // 지도 중심 이동
    if (mapObjRef.current) {
      const kakao = window.kakao;
      const newPos = new kakao.maps.LatLng(place.y, place.x);
      mapObjRef.current.setCenter(newPos);
      mapObjRef.current.setLevel(3);

      // 마커 표시
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new kakao.maps.Marker({
        position: newPos
      });
      markerRef.current.setMap(mapObjRef.current);
    }
  };

  // 위치 선택 확인
  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  // 지도 클릭으로 위치 선택
  const handleMapClick = (e) => {
    if (!mapObjRef.current) return;

    const kakao = window.kakao;
    const latlng = e.latLng;
    
    // 클릭한 위치에 마커 표시
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new kakao.maps.Marker({
      position: latlng
    });
    markerRef.current.setMap(mapObjRef.current);

    // 주소 정보 가져오기
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const address = result[0].address;
        setSelectedLocation({
          name: `${address.region_1depth_name} ${address.region_2depth_name}`,
          address: address.address_name,
          lat: latlng.getLat(),
          lng: latlng.getLng()
        });
      }
    });
  };

  // 지도 클릭 이벤트 등록
  useEffect(() => {
    if (mapReady && mapObjRef.current) {
      const kakao = window.kakao;
      kakao.maps.event.addListener(mapObjRef.current, 'click', handleMapClick);
    }
  }, [mapReady]);

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <h3>📍 위치 선택</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="location-modal-content">
          {/* 검색 영역 */}
          <div className="location-search">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="장소를 검색하세요..."
                className="location-search-input"
                onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
              />
              <button 
                onClick={searchPlaces}
                className="search-btn"
                disabled={isSearching}
              >
                {isSearching ? "검색 중..." : "검색"}
              </button>
            </div>
          </div>

          <div className="location-modal-body">
            {/* 검색 결과 */}
            <div className="search-results">
              <h4>검색 결과</h4>
              {searchResults.length > 0 ? (
                <div className="results-list">
                  {searchResults.map((place, index) => (
                    <div 
                      key={index}
                      className={`result-item ${selectedLocation?.name === place.place_name ? 'selected' : ''}`}
                      onClick={() => handleResultClick(place)}
                    >
                      <div className="result-name">{place.place_name}</div>
                      <div className="result-address">{place.address_name}</div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="no-results">검색 결과가 없습니다.</div>
              ) : null}
            </div>

            {/* 지도 영역 */}
            <div className="map-container">
              <h4>지도에서 선택</h4>
              <div ref={mapRef} className="location-map"></div>
              <p className="map-instruction">지도를 클릭하여 위치를 선택하거나 위에서 검색하세요.</p>
            </div>
          </div>

          {/* 선택된 위치 표시 */}
          {selectedLocation && (
            <div className="selected-location">
              <h4>선택된 위치</h4>
              <div className="location-display">
                <span className="location-icon">📍</span>
                <div className="location-details">
                  <div className="location-name">{selectedLocation.name}</div>
                  <div className="location-address">{selectedLocation.address}</div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="location-modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              취소
            </button>
            <button 
              type="button" 
              onClick={handleConfirm}
              className="confirm-btn"
              disabled={!selectedLocation}
            >
              위치 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

