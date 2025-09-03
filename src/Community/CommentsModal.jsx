import React, { useState } from "react";
import "./Community.css";

const CommentsModal = ({ isOpen, onClose, post, onSubmit }) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit(post.id, newComment.trim());
      setNewComment("");
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comments-modal-header">
          <h3>💬 댓글 목록</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="comments-modal-content">
          {/* 게시물 미리보기 */}
          <div className="post-preview">
            <div className="post-preview-header">
              <div className="post-user-info">
                <div className="post-avatar" aria-hidden />
                <div className="post-user-meta">
                  <div className="post-user-name">
                    {post.userName} <span className="post-user-badge">{post.userBadge}</span>
                  </div>
                  <div className="post-date">{post.date}</div>
                </div>
              </div>
              <div className="post-rating">
                {'★★★★★'.slice(0, post.rating) + '☆☆☆☆☆'.slice(post.rating)}
              </div>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
              {post.location && (
                <div className="post-location-mini">
                  <span className="location-icon">📍</span>
                  <span className="location-name">{post.location.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="comments-list">
            <h4>댓글 ({post.commentsList.length}개)</h4>
            {post.commentsList.length > 0 ? (
              <div className="comments-container">
                {post.commentsList.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-user">
                        <div className="comment-avatar" aria-hidden />
                        <div className="comment-user-info">
                          <div className="comment-user-name">{comment.userName}</div>
                          <div className="comment-date">{comment.date}</div>
                        </div>
                      </div>
                    </div>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">
                <p>아직 댓글이 없습니다.</p>
                <p>첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>

          {/* 새 댓글 작성 */}
          <div className="new-comment-section">
            <h4>댓글 작성</h4>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="new-comment-input"
                rows="3"
              />
              <div className="new-comment-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  취소
                </button>
                <button 
                  type="submit" 
                  className="submit-comment-btn"
                  disabled={!newComment.trim()}
                >
                  댓글 작성
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
