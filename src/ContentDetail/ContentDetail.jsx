// ContentDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

export default function ContentDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>ÄÜĹŮĂ÷ ťóźź ĆäŔĚÁö</h1>
      <p>ÄÜĹŮĂ÷ ID: {id}</p>
      {/* żŠąâżĄ ťóźź Á¤ş¸ ˇť´ő¸ľ */}
    </div>
  );
}