import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from '../components/Topnav';
import SearchModal from '../components/SearchModal';
import CommentModal from './CommentModal';
import LocationModal from './LocationModal';
import CommentsModal from './CommentsModal';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Sarah Kim",
      userBadge: "JP",
      area: "Busan",
      activities: ["Market", "Food", "Local"],
      tags: ["Location", "Local", "Recommend"],
      rating: 5,
      lang: "en",
      date: "2025-08-10",
      photos: [],
      content: "Visited a small local market near Jagalchi. Super friendly vendors and amazing street food! If you want the 'real local' vibe, don't miss this place.",
      likes: 12,
      comments: 3,
      likedBy: [],
      commentsList: [
        { id: 1, userName: "Traveler123", content: "정말 좋은 정보네요! 다음에 가보겠습니다.", date: "2025-08-10" },
        { id: 2, userName: "FoodLover", content: "사진도 더 올려주세요!", date: "2025-08-10" },
        { id: 3, userName: "LocalGuide", content: "추천해주신 곳 정말 맛있어요!", date: "2025-08-10" }
      ],
      location: {
        name: "Jagalchi Market",
        address: "부산 중구 자갈치로 52",
        lat: 35.0984,
        lng: 129.0256
      }
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null, postTitle: "" });
  const [commentsModal, setCommentsModal] = useState({ isOpen: false, post: null });
  const [locationModal, setLocationModal] = useState({ isOpen: false });
  const [activeFilter, setActiveFilter] = useState("top");

  // 사진 업로드 기능 주석처리
  /*
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB 제한
    );

    if (validFiles.length + selectedPhotos.length > 5) {
      alert('최대 5장까지 업로드 가능합니다.');
      return;
    }

    const newPhotos = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedPhotos([...selectedPhotos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    const photoToRemove = selectedPhotos.find(photo => photo.id === photoId);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    setSelectedPhotos(selectedPhotos.filter(photo => photo.id !== photoId));
  };
  */

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationModal({ isOpen: false });
  };

  const removeLocation = () => {
    setSelectedLocation(null);
  };

  const handleShare = () => {
    if (!newPost.trim() && selectedPhotos.length === 0) return;

    const newPostData = {
      id: posts.length + 1,
      userName: "You",
      userBadge: "KR",
      area: selectedLocation ? selectedLocation.name.split(' ')[0] : "Seoul",
      activities: ["Culture", "Food"],
      tags: selectedLocation ? ["Location", "Local", "Recommend"] : ["Location", "Culture"],
      rating: 4,
      lang: "ko",
      date: new Date().toISOString().split('T')[0],
      photos: selectedPhotos.map(photo => photo.preview),
      content: newPost.trim(),
      likes: 0,
      comments: 0,
      likedBy: [],
      commentsList: [],
      location: selectedLocation
    };

    setPosts([newPostData, ...posts]);
    setNewPost(""); // 입력창 초기화
    setSelectedPhotos([]); // 사진 초기화
    setSelectedLocation(null); // 위치 초기화
  };

  const handleLike = (postId, event) => {
    event.stopPropagation(); // 게시물 클릭 방지
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes("currentUser");
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(user => user !== "currentUser")
            : [...post.likedBy, "currentUser"]
        };
      }
      return post;
    }));
  };

  const handleComment = (postId, event) => {
    event.stopPropagation(); // 게시물 클릭 방지
    const post = posts.find(p => p.id === postId);
    setCommentModal({
      isOpen: true,
      postId: postId,
      postTitle: post.content.substring(0, 30) + (post.content.length > 30 ? "..." : "")
    });
  };

  const handleViewComments = (post, event) => {
    event.stopPropagation(); // 게시물 클릭 방지
    setCommentsModal({
      isOpen: true,
      post: post
    });
  };

  const handleCommentSubmit = (postId, commentText) => {
    const newComment = {
      id: Date.now(),
      userName: "You",
      content: commentText,
      date: new Date().toISOString().split('T')[0]
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...post.commentsList, newComment]
        };
      }
      return post;
    }));
  };

  const handleSharePost = (postId, event) => {
    event.stopPropagation(); // 게시물 클릭 방지
    alert('게시물이 공유되었습니다! (개발 중)');
  };

  const getFilteredPosts = () => {
    switch (activeFilter) {
      case "views":
        return [...posts].sort((a, b) => b.likes - a.likes);
      case "photos":
        return posts.filter(post => post.photos && post.photos.length > 0);
      default:
        return posts;
    }
  };

  return (
    <div className="community-page">
      <Topnav onSearchClick={() => setIsSearchOpen(true)} />
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

      {/* <h2 className="community-title">오늘 본 공연, 같이 얘기해볼래?</h2> */}

      {/* Coming Soon 메시지 */}
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">
            <img src="/images/comingsoon.png" alt="Coming Soon" className="coming-soon-image" />
          </div>
          <h1 className="coming-soon-title">Coming Soon...</h1>
          <p className="coming-soon-subtitle">커뮤니티 기능이 곧 출시됩니다!</p>
          <div className="coming-soon-animation">
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
          </div>
        </div>
      </div>

      {/* 기존 내용들 - 모두 주석처리 */}
      {/*
      {/* 필터 탭 */}
      {/*
      <div className="community-filters">
        <select className="filter-select">
          <option>오늘</option>
          <option>이번 주</option>
          <option>이번 달</option>
        </select>
        <button 
          className={`tab ${activeFilter === "top" ? "active" : ""}`}
          onClick={() => setActiveFilter("top")}
        >
          Top Post
        </button>
        <button 
          className={`tab ${activeFilter === "views" ? "active" : ""}`}
          onClick={() => setActiveFilter("views")}
        >
          ⭐ Views
        </button>
        <button 
          className={`tab ${activeFilter === "photos" ? "active" : ""}`}
          onClick={() => setActiveFilter("photos")}
        >
          📷 Photos
        </button>
      </div>
      */}

      {/* 공유 업로드 박스 */}
      {/*
      <section className="upload-box">
        <div className="upload-header">
          <img src="/profile.png" alt="User" className="profile-pic" />
          <textarea
            placeholder="Share your Korean cultural experiences..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>
        
        {/* 사진 미리보기 영역 - 주석처리 */}
        {/*
        {selectedPhotos.length > 0 && (
          <div className="photo-preview-container">
            <div className="photo-preview-grid">
              {selectedPhotos.map((photo) => (
                <div key={photo.id} className="photo-preview-item">
                  <img 
                    src={photo.preview} 
                    alt="Preview" 
                    className="photo-preview"
                  />
                  <button 
                    className="remove-photo-btn"
                    onClick={() => removePhoto(photo.id)}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        */}

        {/* 위치 미리보기 영역 */}
        {/*
        {selectedLocation && (
          <div className="location-preview-container">
            <div className="location-preview">
              <div className="location-info">
                <span className="location-icon">📍</span>
                <div className="location-details">
                  <div className="location-name">{selectedLocation.name}</div>
                  <div className="location-address">{selectedLocation.address}</div>
                </div>
              </div>
              <button 
                className="remove-location-btn"
                onClick={removeLocation}
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="upload-options">
          {/* 사진 업로드 버튼 주석처리 */}
          {/*
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()}>
            📷 Add Photo ({selectedPhotos.length}/5)
          </button>
          */}
          {/*
          <button onClick={() => setLocationModal({ isOpen: true })}>
            📍 Add Location
          </button>
          <button 
            className="submit-btn" 
            onClick={handleShare}
            disabled={!newPost.trim() && selectedPhotos.length === 0}
          >
            공유하기 💖
          </button>
        </div>
      </section>
      */}

      {/* 커뮤니티 메인 */}
      {/*
      <main className="community-main">
        {/* 왼쪽 피드 */}
        {/*
        <section className="feed-left">
          {getFilteredPosts().map(post => (
            <article 
              className="review-card" 
              key={post.id}
              onClick={() => navigate('/review', { state: { review: post } })}
              style={{ cursor: 'pointer' }}
            >
              <header className="review-header">
                <div className="review-user">
                  <div className="review-avatar" aria-hidden />
                  <div className="review-user-meta">
                    <div className="review-name">
                      {post.userName} <span className="review-badge">{post.userBadge}</span>
                    </div>
                    <div className="review-sub">
                      Area: {post.area} | Activities: {post.activities.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="review-rating" aria-label={`${post.rating} out of 5`}>
                  {'★★★★★'.slice(0, post.rating) + '☆☆☆☆☆'.slice(post.rating)}
                </div>
              </header>

              <div className="review-body">
                <div className="review-photo">
                  {post.photos?.length ? (
                    <div className="post-photos">
                      {post.photos.length === 1 ? (
                        <img src={post.photos[0]} alt="review" />
                      ) : (
                        <div className="multiple-photos">
                          <img src={post.photos[0]} alt="review" className="main-photo" />
                          {post.photos.length > 1 && (
                            <div className="photo-overlay">
                              <span>+{post.photos.length - 1}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="photo-placeholder">🖼 사진 영역</div>
                  )}
                </div>
                <p className="review-text">{post.content}</p>
                
                {/* 위치 정보 표시 */}
                {/*
                {post.location && (
                  <div className="post-location">
                    <span className="location-icon">📍</span>
                    <div className="location-info">
                      <div className="location-name">{post.location.name}</div>
                      <div className="location-address">{post.location.address}</div>
                    </div>
                  </div>
                )}
              </div>

              <footer className="review-footer">
                <div className="review-chips">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="chip">{tag}</span>
                  ))}
                </div>
                <div className="review-actions" role="group" aria-label="리뷰 액션">
                  <button 
                    className={`icon-btn ${post.likedBy.includes("currentUser") ? "liked" : ""}`} 
                    title="like"
                    onClick={(e) => handleLike(post.id, e)}
                  >
                    {post.likedBy.includes("currentUser") ? "❤️" : "♥"} {post.likes}
                  </button>
                  <button 
                    className="icon-btn" 
                    title="comment"
                    onClick={(e) => handleComment(post.id, e)}
                  >
                    💬 {post.comments}
                  </button>
                  <button 
                    className="icon-btn view-comments-btn" 
                    title="view comments"
                    onClick={(e) => handleViewComments(post, e)}
                  >
                    👁️ 댓글보기
                  </button>
                  <button 
                    className="icon-btn" 
                    title="share"
                    onClick={(e) => handleSharePost(post.id, e)}
                  >
                    🔗 공유
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        {/* 오른쪽 사이드바 */}
        {/*
        <aside className="feed-right">
          <div className="upcoming-events">
            <h4>📅 Upcoming Events</h4>
            <ul>
              <li>🎭 연극 A - 8/10</li>
              <li>🎬 영화 B - 8/12</li>
              <li>🎤 콘서트 C - 8/14</li>
            </ul>
            <button className="view-all">전체 보기</button>
          </div>

          <div className="community-lists">
            <h4>📝 Community Lists</h4>
            <ul>
              <li onClick={() => navigate('/community/country-board')} className="clickable-list-item">
                📌 나라별 게시판
              </li>
              <li onClick={() => navigate('/community/travel-partner')} className="clickable-list-item">
                📌 동행 구해요
              </li>
              <li onClick={() => navigate('/community/review-recommend')} className="clickable-list-item">
                📌 리뷰 / 추천
              </li>
              <li onClick={() => navigate('/community/discount-ticket')} className="clickable-list-item">
                📌 땡처리 티켓
              </li>
            </ul>
          </div>
        </aside>
      </main>
      */}

      {/* 댓글 모달 */}
      {/*
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal({ isOpen: false, postId: null, postTitle: "" })}
        onSubmit={handleCommentSubmit}
        postId={commentModal.postId}
        postTitle={commentModal.postTitle}
      />

      {/* 댓글 목록 모달 */}
      {/*
      <CommentsModal
        isOpen={commentsModal.isOpen}
        onClose={() => setCommentsModal({ isOpen: false, post: null })}
        post={commentsModal.post}
        onSubmit={handleCommentSubmit}
      />

      {/* 위치 선택 모달 */}
      {/*
      <LocationModal
        isOpen={locationModal.isOpen}
        onClose={() => setLocationModal({ isOpen: false })}
        onSelect={handleLocationSelect}
      />
      */}
    </div>
  );
};

export default Community;
