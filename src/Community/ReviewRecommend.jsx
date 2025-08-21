import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from '../components/Topnav';
import CommentModal from './CommentModal';
import './Community.css';

const ReviewRecommend = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Sophie Anderson",
      userBadge: "UK",
      category: "Restaurant",
      title: "Best Korean BBQ in Myeongdong",
      rating: 5,
      location: "Myeongdong, Seoul",
      content: "Found this amazing Korean BBQ place called 'Mapo Galbi' in Myeongdong! The meat quality is incredible and the service is super friendly. Must-try: their marinated galbi and fresh kimchi. Price is reasonable for the quality. Highly recommend for anyone visiting Seoul!",
      photos: [],
      date: "2025-01-15",
      likes: 24,
      comments: 18,
      tags: ["Korean BBQ", "Myeongdong", "Seoul", "Food", "Must-try"],
      liked: false,
      commentsList: []
    },
    {
      id: 2,
      userName: "Carlos Rodriguez",
      userBadge: "MX",
      category: "Attraction",
      title: "Hidden Gem: Bukchon Hanok Village",
      rating: 4,
      location: "Bukchon, Seoul",
      content: "¡Increíble experiencia en Bukchon Hanok Village! Es como viajar en el tiempo. Los hanoks tradicionales son hermosos y las vistas de la ciudad son espectaculares. Consejo: ve temprano en la mañana para evitar multitudes y tomar mejores fotos. Solo recuerda ser respetuoso ya que la gente vive ahí.",
      photos: [],
      date: "2025-01-14",
      likes: 31,
      comments: 22,
      tags: ["Bukchon", "Hanok", "Traditional", "Seoul", "Photography"],
      liked: false,
      commentsList: []
    },
    {
      id: 3,
      userName: "Yuki Tanaka",
      userBadge: "JP",
      category: "Cafe",
      title: "Cozy Traditional Tea House",
      rating: 5,
      location: "Insadong, Seoul",
      content: "韓国の伝統的な茶屋で素晴らしい体験をしました。インサドンの「茶山房」は、韓国の伝統茶とお菓子を楽しめる隠れた名所です。抹茶と韓国茶の違いを味わえて、とても興味深かったです。静かな雰囲気で、疲れた旅行者の休憩に最適です。",
      photos: [],
      date: "2025-01-13",
      likes: 19,
      comments: 14,
      tags: ["Tea House", "Insadong", "Traditional", "Seoul", "Relaxing"],
      liked: false,
      commentsList: []
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null, postTitle: "" });

  const categories = [
    { code: "all", name: "All Categories", icon: "📋" },
    { code: "Restaurant", name: "Restaurant", icon: "🍽️" },
    { code: "Cafe", name: "Cafe", icon: "☕" },
    { code: "Attraction", name: "Attraction", icon: "🏛️" },
    { code: "Shopping", name: "Shopping", icon: "🛍️" },
    { code: "Transport", name: "Transport", icon: "🚇" },
    { code: "Accommodation", name: "Accommodation", icon: "🏨" }
  ];

  const ratings = [
    { code: "all", name: "All Ratings", icon: "⭐" },
    { code: "5", name: "5 Stars", icon: "⭐⭐⭐⭐⭐" },
    { code: "4", name: "4+ Stars", icon: "⭐⭐⭐⭐" },
    { code: "3", name: "3+ Stars", icon: "⭐⭐⭐" }
  ];

  const handleShare = () => {
    if (!newPost.trim()) return;

    const newPostData = {
      id: posts.length + 1,
      userName: "You",
      userBadge: "KR",
      category: "Restaurant",
      title: "New Recommendation",
      rating: 4,
      location: "Seoul",
      content: newPost.trim(),
      photos: [],
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
      tags: ["New Post"],
      liked: false,
      commentsList: []
    };

    setPosts([newPostData, ...posts]);
    setNewPost("");
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId, commentText) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...post.commentsList, {
            id: Date.now(),
            text: commentText,
            userName: "You",
            date: new Date().toISOString().split('T')[0]
          }]
        };
      }
      return post;
    }));
  };

  const openCommentModal = (postId, postTitle) => {
    setCommentModal({ isOpen: true, postId, postTitle });
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, postId: null, postTitle: "" });
  };

  const handleAddToMap = (post) => {
    alert(`🗺️ "${post.title}"이(가) 내 지도에 추가되었습니다!\n\n${post.location}에 저장되었습니다.`);
  };

  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === "all" || post.category === selectedCategory;
    const ratingMatch = selectedRating === "all" || post.rating >= parseInt(selectedRating);
    return categoryMatch && ratingMatch;
  });

  return (
    <div className="community-page">
      <Topnav />
      
      <div className="community-header">
        <button className="back-btn" onClick={() => navigate('/community')}>
          ← Back to Community
        </button>
        <h2 className="community-title">📝 Reviews & Recommendations</h2>
      </div>

      {/* 필터 */}
      <div className="review-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.code} value={cat.code}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Rating:</label>
          <select 
            value={selectedRating} 
            onChange={(e) => setSelectedRating(e.target.value)}
            className="filter-select"
          >
            {ratings.map(rating => (
              <option key={rating.code} value={rating.code}>
                {rating.icon} {rating.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 공유 업로드 박스 */}
      <section className="upload-box">
        <div className="upload-header">
          <img src="/profile.png" alt="User" className="profile-pic" />
          <textarea
            placeholder="Share your reviews, recommendations, and tips for Korea..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>
        <div className="upload-options">
          <button>📋 Add Category</button>
          <button>⭐ Add Rating</button>
          <button className="submit-btn" onClick={handleShare}>Share Review 💖</button>
        </div>
      </section>

      {/* 게시글 목록 */}
      <main className="community-main">
        <section className="feed-left">
          {filteredPosts.map(post => (
            <article className="review-card" key={post.id}>
              <header className="review-header">
                <div className="review-user">
                  <div className="review-avatar" aria-hidden />
                  <div className="review-user-meta">
                    <div className="review-name">
                      {post.userName} <span className="review-badge">{post.userBadge}</span>
                    </div>
                    <div className="review-sub">
                      {post.category} | {post.location}
                    </div>
                  </div>
                </div>
                <div className="review-rating" aria-label={`${post.rating} out of 5`}>
                  {'★'.repeat(post.rating) + '☆'.repeat(5 - post.rating)}
                </div>
              </header>

              <div className="review-body">
                <div className="review-photo">
                  {post.photos?.length ? (
                    <img src={post.photos[0]} alt="review" />
                  ) : (
                    <div className="photo-placeholder">📝 Review</div>
                  )}
                </div>
                <div className="review-content">
                  <h3 className="review-title">{post.title}</h3>
                  <p className="review-text">{post.content}</p>
                </div>
              </div>

              <footer className="review-footer">
                <div className="review-chips">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="chip">{tag}</span>
                  ))}
                </div>
                <div className="review-actions">
                  <button 
                    className={`icon-btn ${post.liked ? 'liked' : ''}`} 
                    title="like"
                    onClick={() => handleLike(post.id)}
                  >
                    ♥ {post.likes}
                  </button>
                  <button 
                    className="icon-btn" 
                    title="comment"
                    onClick={() => openCommentModal(post.id, post.title)}
                  >
                    💬 {post.comments}
                  </button>
                  <button 
                    className="icon-btn" 
                    title="add to map"
                    onClick={() => handleAddToMap(post)}
                  >
                    🗺️ 내 지도에 추가
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        <aside className="feed-right">
          <div className="review-stats">
            <h4>📊 Review Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <span className="stat-count">{posts.length}</span>
                <span className="stat-name">Total Reviews</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-count">{(posts.reduce((sum, post) => sum + post.rating, 0) / posts.length).toFixed(1)}</span>
                <span className="stat-name">Avg Rating</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏷️</span>
                <span className="stat-count">{new Set(posts.map(p => p.category)).size}</span>
                <span className="stat-name">Categories</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        onSubmit={handleComment}
        postId={commentModal.postId}
        postTitle={commentModal.postTitle}
      />
    </div>
  );
};

export default ReviewRecommend;
