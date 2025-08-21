import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topnav from './Topnav';
import './TestDatabase.css';

const TestDatabase = () => {
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState([]);

  // 로컬 스토리지에서 테스트 결과 불러오기
  useEffect(() => {
    const savedResults = localStorage.getItem('theaterMBTIResults');
    if (savedResults) {
      setTestHistory(JSON.parse(savedResults));
    }
  }, []);

  const handleNewTest = () => {
    navigate('/test/my-test');
  };

  const handleViewDetails = (test) => {
    navigate('/test/results', { 
      state: { 
        testResults: test.answers 
      } 
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 테스트 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('theaterMBTIResults');
      setTestHistory([]);
    }
  };

  return (
    <div className="test-database-container">
      <Topnav />
      
      <div className="test-database-content">
        <div className="test-database-header">
          <div className="header-content">
            <h1 className="test-database-title">Theater MBTI History</h1>
            <div className="header-buttons">
              <button className="new-test-btn" onClick={handleNewTest}>
                New Test
              </button>
              {testHistory.length > 0 && (
                <button className="clear-history-btn" onClick={handleClearHistory}>
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 테스트 결과가 없을 때 */}
        {testHistory.length === 0 && (
          <div className="no-results-section">
            <div className="no-results-content">
              <h2>아직 테스트 결과가 없습니다</h2>
              <p>첫 번째 Theater MBTI 테스트를 시작해보세요!</p>
              <button className="start-test-btn" onClick={handleNewTest}>
                테스트 시작하기
              </button>
            </div>
          </div>
        )}

        {/* 테스트 결과 목록 */}
        {testHistory.length > 0 && (
          <div className="test-list-section">
            <div className="test-list-header">
              <div className="list-header-item">Date</div>
              <div className="list-header-item">Time</div>
              <div className="list-header-item">Theater MBTI</div>
              <div className="list-header-item">Actions</div>
            </div>
            
            <div className="test-list">
              {testHistory.map((test, index) => (
                <div key={index} className="test-item">
                  <div className="test-item-cell date-cell">
                    {test.date}
                  </div>
                  <div className="test-item-cell time-cell">
                    {test.time}
                  </div>
                  <div className="test-item-cell mbti-cell">
                    <span className="mbti-code">{test.typeCode}</span>
                  </div>
                  <div className="test-item-cell actions-cell">
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(test)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDatabase;
