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
        <h1>Tech Dashboard</h1>
        <p className="subtitle">Global Intelligence. Real-time. Curated.</p>
        
        <div className="tab-switcher">
          <button className={activeTab === 'github' ? 'active' : ''} onClick={() => setActiveTab('github')}>GitHub 排行</button>
          <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>科技头条</button>
          <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>AI 前沿</button>
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

        {activeTab === 'ai' && (
          <div className="news-list">
            {data.aiNews?.map((news, i) => (
              <div className="news-card simple" key={i}>
                <div className="news-content">
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="news-title">{news.title}</a>
                    {news.author && <p className="news-original">作者: {news.author}</p>}
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
