import React, { useState } from "react";
import "./Community.css";

const CommentModal = ({ isOpen, onClose, onSubmit, postId, postTitle }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(postId, comment.trim());
      setComment("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>💬 댓글 작성</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="comment-modal-content">
          <p className="post-title">"{postTitle}"</p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
              rows="4"
              autoFocus
            />
            <div className="comment-modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                취소
              </button>
              <button type="submit" className="submit-comment-btn">
                댓글 작성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
