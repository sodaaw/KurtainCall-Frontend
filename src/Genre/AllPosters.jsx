import React from 'react';
import './Genre.css';
import posters from './postersData'; // 외부 데이터 분리 가능

const AllPosters = () => (
  <div className="genre-container">
    <h2>All Posters</h2>
    <section className="poster-section grid-all">
      {posters.map(p => (
        <div key={p.id} className="poster-card">
          <img src={p.image} alt={p.title} className="poster-img" />
          <h4>{p.title}</h4>
          <p>{p.category} | {p.location}</p>
        </div>
      ))}
    </section>
  </div>
);

export default AllPosters;
