import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topnav from '../components/Topnav';
import "./Community.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticket } = location.state || {};

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!ticket) {
    navigate('/community/discount-ticket');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // 결제 처리 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false);
      alert(`🎉 결제가 완료되었습니다!\n\n${ticket.eventName}\n${ticket.discountPrice} 결제 완료\n\n이메일로 티켓을 발송했습니다.`);
      navigate('/community/discount-ticket');
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="community-page">
      <Topnav />
      
      <div className="payment-container">
        <div className="payment-header">
          <button className="back-btn" onClick={() => navigate('/community/discount-ticket')}>
            ← 뒤로 가기
          </button>
          <h2 className="payment-title">💳 결제 페이지</h2>
        </div>

        <div className="payment-content">
          <div className="ticket-summary">
            <h3>🎫 구매할 티켓 정보</h3>
            <div className="ticket-info">
              <div className="ticket-detail">
                <span className="label">공연명:</span>
                <span className="value">{ticket.eventName}</span>
              </div>
              <div className="ticket-detail">
                <span className="label">장소:</span>
                <span className="value">{ticket.location}</span>
              </div>
              <div className="ticket-detail">
                <span className="label">날짜:</span>
                <span className="value">{ticket.date}</span>
              </div>
              <div className="ticket-detail">
                <span className="label">수량:</span>
                <span className="value">{ticket.quantity}매</span>
              </div>
              <div className="ticket-detail price">
                <span className="label">결제 금액:</span>
                <span className="value final-price">{ticket.discountPrice}</span>
              </div>
            </div>
          </div>

          <div className="payment-form-container">
            <h3>💳 결제 정보 입력</h3>
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>카드 번호</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo(prev => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value)
                  }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>만료일</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => setPaymentInfo(prev => ({
                      ...prev,
                      expiryDate: formatExpiryDate(e.target.value)
                    }))}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentInfo.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>카드 소유자명</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={paymentInfo.cardholderName}
                  onChange={handleInputChange}
                  placeholder="홍길동"
                  required
                />
              </div>

              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={paymentInfo.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="payment-submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "결제 처리 중..." : `💳 ${ticket.discountPrice} 결제하기`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
