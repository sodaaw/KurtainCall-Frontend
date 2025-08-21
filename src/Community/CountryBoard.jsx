import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from '../components/Topnav';
import CommentModal from './CommentModal';
import './Community.css';

const CountryBoard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Emma Wilson",
      userBadge: "US",
      country: "United States",
      content: "Planning to visit Korea in September! Looking for recommendations for traditional markets and street food in Seoul. Any tips for first-time visitors?",
      date: "2025-01-15",
      likes: 12,
      comments: 8,
      tags: ["Seoul", "Food", "First-time"],
      liked: false,
      commentsList: []
    },
    {
      id: 2,
      userName: "Pierre Dubois",
      userBadge: "FR",
      country: "France",
      content: "Bonjour! I'm interested in Korean traditional music and dance. Can anyone recommend good places to experience this in Busan?",
      date: "2025-01-14",
      likes: 7,
      comments: 5,
      tags: ["Busan", "Culture", "Music"],
      liked: false,
      commentsList: []
    },
    {
      id: 3,
      userName: "Yuki Tanaka",
      userBadge: "JP",
      country: "Japan",
      content: "日本の方で韓国旅行を計画している方いませんか？一緒に旅行できたら楽しいと思います。特に釜山の海鮮料理に興味があります。",
      date: "2025-01-13",
      likes: 15,
      comments: 12,
      tags: ["Busan", "Seafood", "Travel Partner"],
      liked: false,
      commentsList: []
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null, postTitle: "" });

  const countries = [
    { code: "all", name: "All Countries", flag: "🌍" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "CA", name: "Canada", flag: "🇨🇦" }
  ];

  const handleShare = () => {
    if (!newPost.trim()) return;

    const newPostData = {
      id: posts.length + 1,
      userName: "You",
      userBadge: "KR",
      country: "Korea",
      content: newPost.trim(),
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

  const filteredPosts = selectedCountry === "all" 
    ? posts 
    : posts.filter(post => post.userBadge === selectedCountry);

  return (
    <div className="community-page">
      <Topnav />
      
      <div className="community-header">
        <button className="back-btn" onClick={() => navigate('/community')}>
          ← Back to Community
        </button>
        <h2 className="community-title">🌍 Country Board</h2>
      </div>

      {/* 국가별 필터 */}
      <div className="country-filters">
        {countries.map(country => (
          <button
            key={country.code}
            className={`country-filter ${selectedCountry === country.code ? 'active' : ''}`}
            onClick={() => setSelectedCountry(country.code)}
          >
            <span className="country-flag">{country.flag}</span>
            <span className="country-name">{country.name}</span>
          </button>
        ))}
      </div>

      {/* 공유 업로드 박스 */}
      <section className="upload-box">
        <div className="upload-header">
          <img src="/profile.png" alt="User" className="profile-pic" />
          <textarea
            placeholder="Share your country-specific questions or experiences..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>
        <div className="upload-options">
          <button>🌍 Add Country</button>
          <button>📷 Add Photo</button>
          <button className="submit-btn" onClick={handleShare}>Share 💖</button>
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
                      Country: {post.country} | Date: {post.date}
                    </div>
                  </div>
                </div>
                <div className="post-country-flag">
                  {countries.find(c => c.code === post.userBadge)?.flag || '🌍'}
                </div>
              </header>

              <div className="review-body">
                <div className="review-photo">
                  <div className="photo-placeholder">🌍 Country Post</div>
                </div>
                <p className="review-text">{post.content}</p>
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
                    onClick={() => openCommentModal(post.id, post.content.substring(0, 30) + "...")}
                  >
                    💬 {post.comments}
                  </button>
                  <button className="icon-btn" title="share">🔗 Share</button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        <aside className="feed-right">
          <div className="country-stats">
            <h4>📊 Country Statistics</h4>
            <div className="stats-grid">
              {countries.slice(1).map(country => {
                const count = posts.filter(post => post.userBadge === country.code).length;
                return (
                  <div key={country.code} className="stat-item">
                    <span className="stat-flag">{country.flag}</span>
                    <span className="stat-count">{count}</span>
                    <span className="stat-name">{country.name}</span>
                  </div>
                );
              })}
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

export default CountryBoard;
