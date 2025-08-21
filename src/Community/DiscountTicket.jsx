import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topnav from '../components/Topnav';
import CommentModal from './CommentModal';
import './Community.css';

const DiscountTicket = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "David Kim",
      userBadge: "KR",
      ticketType: "Concert",
      eventName: "BTS Concert in Seoul",
      originalPrice: "150,000원",
      discountPrice: "120,000원",
      discount: "20% OFF",
      quantity: 2,
      location: "Olympic Stadium, Seoul",
      date: "2025-02-20",
      expiryDate: "2025-01-25",
      content: "Selling 2 BTS concert tickets at 20% discount! Can't attend due to work schedule. Seats are in section A, great view. Must sell by this weekend. Contact me for details!",
      photos: [],
      postDate: "2025-01-15",
      likes: 45,
      comments: 23,
      tags: ["BTS", "Concert", "Seoul", "Discount", "Urgent"],
      liked: false,
      commentsList: []
    },
    {
      id: 2,
      userName: "Sarah Johnson",
      userBadge: "US",
      ticketType: "Musical",
      eventName: "The Lion King Musical",
      originalPrice: "80,000원",
      discountPrice: "60,000원",
      discount: "25% OFF",
      quantity: 1,
      location: "Charlotte Theater, Seoul",
      date: "2025-03-15",
      expiryDate: "2025-02-20",
      content: "One ticket available for The Lion King musical! Beautiful production, perfect for families. Selling at 25% discount. Can meet in Hongdae area for exchange.",
      photos: [],
      postDate: "2025-01-14",
      likes: 18,
      comments: 12,
      tags: ["Musical", "Lion King", "Family", "Hongdae", "Good Deal"],
      liked: false,
      commentsList: []
    },
    {
      id: 3,
      userName: "Yuki Tanaka",
      userBadge: "JP",
      ticketType: "Theater",
      eventName: "Hamlet Performance",
      originalPrice: "100,000원",
      discountPrice: "70,000원",
      discount: "30% OFF",
      quantity: 3,
      location: "National Theater, Seoul",
      date: "2025-02-10",
      expiryDate: "2025-01-30",
      content: "3枚のハムレット公演チケットを30%割引で販売します！古典演劇が好きな方におすすめです。座席は前列で、素晴らしい視界です。急いで売りたいので、お早めにご連絡ください。",
      photos: [],
      postDate: "2025-01-13",
      likes: 12,
      comments: 8,
      tags: ["Hamlet", "Classical", "Theater", "Front Row", "Great View"],
      liked: false,
      commentsList: []
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [selectedTicketType, setSelectedTicketType] = useState("all");
  const [selectedDiscount, setSelectedDiscount] = useState("all");
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null, postTitle: "" });

  const ticketTypes = [
    { code: "all", name: "All Types", icon: "🎫" },
    { code: "Concert", name: "Concert", icon: "🎤" },
    { code: "Musical", name: "Musical", icon: "🎭" },
    { code: "Theater", name: "Theater", icon: "🎪" },
    { code: "Sports", name: "Sports", icon: "⚽" },
    { code: "Exhibition", name: "Exhibition", icon: "🖼️" },
    { code: "Festival", name: "Festival", icon: "🎉" }
  ];

  const discountRanges = [
    { code: "all", name: "All Discounts", icon: "💰" },
    { code: "10", name: "10%+ OFF", icon: "💸" },
    { code: "20", name: "20%+ OFF", icon: "💸💸" },
    { code: "30", name: "30%+ OFF", icon: "💸💸💸" }
  ];

  const handleShare = () => {
    if (!newPost.trim()) return;

    const newPostData = {
      id: posts.length + 1,
      userName: "You",
      userBadge: "KR",
      ticketType: "Concert",
      eventName: "New Event",
      originalPrice: "100,000원",
      discountPrice: "80,000원",
      discount: "20% OFF",
      quantity: 1,
      location: "Seoul",
      date: "2025-02-01",
      expiryDate: "2025-01-25",
      content: newPost.trim(),
      photos: [],
      postDate: new Date().toISOString().split('T')[0],
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

  const handleBuy = (post) => {
    navigate('/community/payment', { state: { ticket: post } });
  };

  const filteredPosts = posts.filter(post => {
    const typeMatch = selectedTicketType === "all" || post.ticketType === selectedTicketType;
    const discountMatch = selectedDiscount === "all" || 
      parseInt(post.discount.replace('% OFF', '')) >= parseInt(selectedDiscount);
    return typeMatch && discountMatch;
  });

  return (
    <div className="community-page">
      <Topnav />
      
      <div className="community-header">
        <button className="back-btn" onClick={() => navigate('/community')}>
          ← Back to Community
        </button>
        <h2 className="community-title">🎫 Discount Tickets</h2>
      </div>

      {/* 필터 */}
      <div className="ticket-filters">
        <div className="filter-group">
          <label>Ticket Type:</label>
          <select 
            value={selectedTicketType} 
            onChange={(e) => setSelectedTicketType(e.target.value)}
            className="filter-select"
          >
            {ticketTypes.map(type => (
              <option key={type.code} value={type.code}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Discount:</label>
          <select 
            value={selectedDiscount} 
            onChange={(e) => setSelectedDiscount(e.target.value)}
            className="filter-select"
          >
            {discountRanges.map(discount => (
              <option key={discount.code} value={discount.code}>
                {discount.icon} {discount.name}
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
            placeholder="Selling discounted tickets? Share the details, prices, and why you're selling..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>
        <div className="upload-options">
          <button>🎫 Add Ticket Info</button>
          <button>💰 Add Price</button>
          <button className="submit-btn" onClick={handleShare}>Sell Ticket 💖</button>
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
                      {post.ticketType} | {post.location}
                    </div>
                  </div>
                </div>
                <div className="ticket-discount">
                  <span className="discount-badge">{post.discount}</span>
                </div>
              </header>

              <div className="review-body">
                <div className="review-photo">
                  {post.photos?.length ? (
                    <img src={post.photos[0]} alt="ticket" />
                  ) : (
                    <div className="photo-placeholder">🎫 Ticket</div>
                  )}
                </div>
                <div className="ticket-details">
                  <h3 className="ticket-title">{post.eventName}</h3>
                  <div className="price-info">
                    <span className="original-price">{post.originalPrice}</span>
                    <span className="discount-price">{post.discountPrice}</span>
                  </div>
                  <div className="ticket-meta">
                    <span>📅 {post.date}</span>
                    <span>🎭 {post.quantity} ticket(s)</span>
                    <span>⏰ Expires: {post.expiryDate}</span>
                  </div>
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
                    onClick={() => openCommentModal(post.id, post.eventName)}
                  >
                    💬 {post.comments}
                  </button>
                  <button 
                    className="icon-btn" 
                    title="buy"
                    onClick={() => handleBuy(post)}
                  >
                    🛒 Buy
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        <aside className="feed-right">
          <div className="ticket-stats">
            <h4>📊 Ticket Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">🎫</span>
                <span className="stat-count">{posts.length}</span>
                <span className="stat-name">Active Listings</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💰</span>
                <span className="stat-count">{new Set(posts.map(p => p.ticketType)).size}</span>
                <span className="stat-name">Ticket Types</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🎭</span>
                <span className="stat-count">{posts.reduce((sum, post) => sum + post.quantity, 0)}</span>
                <span className="stat-name">Total Tickets</span>
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

export default DiscountTicket;
