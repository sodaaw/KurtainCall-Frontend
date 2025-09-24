import React from 'react';
import './KakaoImage.css';

const KakaoImage = ({
  imageUrl,
  width = "300px",
  height = "200px",
  alt = "카카오맵 이미지",
  className = "",
  style = {}
}) => {
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`kakao-image ${className}`}
      style={{ 
        width, 
        height, 
        objectFit: "cover",
        objectPosition: "center",
        borderRadius: "8px",
        ...style 
      }}
      referrerPolicy="no-referrer"
      onError={(e) => {
        console.log('이미지 로드 실패:', imageUrl);
        e.target.style.display = 'none';
      }}
    />
  );
};

export default KakaoImage;
