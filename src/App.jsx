import React, { useState } from 'react';
import data from './data.json';

const App = () => {
  const [activeTab, setActiveTab] = useState('github');

  return (
    <div className="container">
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header>
        <h1>Intelligence</h1>
        <p className="subtitle">Daily Curated. Multi-source. Global context.</p>
        
        <div className="tab-switcher">
          <button className={activeTab === 'github' ? 'active' : ''} onClick={() => setActiveTab('github')}>GitHub 排行</button>
          <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>Hacker News</button>
        </div>
      </header>

      <main className="content-area">
        {activeTab === 'github' && (
          <div className="rank-list">
            {data.githubRank?.map((item) => (
              <div className="rank-card" key={item.rank}>
                <div className="rank-number">{String(item.rank).padStart(2, '0')}</div>
                <div className="card-content">
                  <div className="card-header">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="project-name">{item.name}</a>
                    <span className="stat-pill">🔥 +{item.dailyGrowth} 今日</span>
                  </div>
                  <p className="project-desc">{item.description}</p>
                  <div className="meta-info">⭐ {item.totalStars} Stars</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="news-list">
            {data.hackerNews?.map((news, i) => (
              <div className="news-card" key={i}>
                <div className="news-score">{news.score}pts</div>
                <div className="news-content">
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="news-title">{news.title}</a>
                    <p className="news-original">{news.originalTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>数据更新于: {data.updateTime}</p>
      </footer>
    </div>
  );
};

export default App;
