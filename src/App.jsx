import React from 'react';
import data from './data.json';

const App = () => {
  return (
    <div className="container">
      {/* Background decoration */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header>
        <h1>GitHub Daily Rank</h1>
        <p className="subtitle">Curated. Translated. Simplified.</p>
      </header>

      <main className="rank-list">
        {data.map((item) => (
          <div className="rank-card" key={item.rank}>
            <div className="rank-number">{String(item.rank).padStart(2, '0')}</div>
            <div className="card-content">
              <div className="card-header">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="project-name">
                  {item.name}
                </a>
                <div className="meta-info">
                  <div className="meta-item"><span>🚀</span> 开源: {item.releaseDate}</div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Stars</span>
                  <span className="stat-value">{item.totalStars}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Daily Growth</span>
                  <span className="stat-value growth-up">+{item.dailyGrowth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Week Trend</span>
                  <span className="stat-value">+{item.weeklyGrowth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Month Trend</span>
                  <span className="stat-value">+{item.monthlyGrowth}</span>
                </div>
              </div>

              <div className="project-desc">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer style={{ marginTop: '8rem', marginBottom: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        <p style={{ letterSpacing: '0.2rem', textTransform: 'uppercase', opacity: 0.5 }}>Premium Dashboard Experience</p>
      </footer>
    </div>
  );
};

export default App;