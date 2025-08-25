import React from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from '../components/Topnav';
import './userPage.css';

const UserPage = () => {
  const navigate = useNavigate();
  
  const handleUserClick = (userNumber) => {
    console.log(`User ${userNumber} clicked`);
    // mainpage로 이동
    navigate('/mainpage');
  };

  return (
    <div className="userpage-container">
      <Topnav />
      
      <div className="userpage-content">
        <div className="userpage-header">
          <h1 className="userpage-title">User Selection</h1>
          <p className="userpage-subtitle">Please select your desired user</p>
        </div>
        
        <div className="user-grid">
          <button 
            className="user-button"
            onClick={() => handleUserClick(1)}
          >
            <div className="user-number">1</div>
            <div className="user-label">User 1</div>
          </button>
          
          <button 
            className="user-button"
            onClick={() => handleUserClick(2)}
          >
            <div className="user-number">2</div>
            <div className="user-label">User 2</div>
          </button>
          
          <button 
            className="user-button"
            onClick={() => handleUserClick(3)}
          >
            <div className="user-number">3</div>
            <div className="user-label">User 3</div>
          </button>
          
          <button 
            className="user-button"
            onClick={() => handleUserClick(4)}
          >
            <div className="user-number">4</div>
            <div className="user-label">User 4</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
