import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from '@vitalets/google-translate-api';
import Parser from 'rss-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parser = new Parser();

const GITHUB_RANK_URL = 'https://raw.githubusercontent.com/OpenGithubs/github-daily-rank/main/README.md';
const OUTPUT_FILE = path.join(__dirname, '../src/data.json');

async function fetchAll() {
    console.log('--- 开始整理全能科技早报 ---');
    const result = {
        githubRank: [],
        hackerNews: [],
        aiNews: [],
        updateTime: new Date().toLocaleString()
    };

    // 1. 获取 GitHub Ranking
    try {
        console.log('1/3 正在拉取 GitHub 排名...');
        const res = await axios.get(GITHUB_RANK_URL);
        const mdContent = res.data;
        const projectRegex = /<h3[^>]*>.*?(\d+)\.\s*?(?:[\s\S]*?)?(https:\/\/github\.com\/[^\s<]+).*?<\/h3>([\s\S]*?)(?=<h3|---|$)/g;
        let match;
        while ((match = projectRegex.exec(mdContent)) !== null) {
            const body = match[3];
            const project = {
                rank: parseInt(match[1]),
                name: match[2].replace('https://github.com/', ''),
                url: match[2],
                totalStars: extractStat(body, '总星标数量'),
                dailyGrowth: extractStat(body, '日增长数量'),
                description: extractStat(body, '项目描述')
            };
            if (project.description && isEnglish(project.description)) {
                const trans = await translate(project.description, { to: 'zh-CN' });
                project.description = trans.text;
            }
            result.githubRank.push(project);
            if (result.githubRank.length >= 10) break;
        }
    } catch (e) { console.error('GitHub Rank 获取失败', e.message); }

    // 2. 获取 Hacker News (前 5)
    try {
        console.log('2/3 正在获取 Hacker News...');
        const topStories = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = topStories.data.slice(0, 5);
        for (const id of ids) {
            const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            let title = story.data.title;
            const trans = await translate(title, { to: 'zh-CN' });
            result.hackerNews.push({
                title: trans.text,
                originalTitle: title,
                url: story.data.url || `https://news.ycombinator.com/item?id=${id}`,
                score: story.data.score
            });
        }
    } catch (e) { console.error('Hacker News 获取失败', e.message); }

    // 3. 获取 AI 动态 (使用 Arxiv AI 类别 RSS)
    try {
        console.log('3/3 正在获取 AI 最新动态...');
        const feed = await parser.parseURL('https://rsshub.app/arxiv/category/cs.AI');
        const items = feed.items.slice(0, 5);
        for (const item of items) {
            const trans = await translate(item.title, { to: 'zh-CN' });
            result.aiNews.push({
                title: trans.text,
                url: item.link,
                author: item.creator || item.author
            });
        }
    } catch (e) { 
        console.log('AI RSS 获取超时或失败，尝试简易数据源...');
        result.aiNews.push({ title: 'AI 领域最新动态暂不可用，可查看 GitHub 排行榜中的 AI 项目', url: '#' });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log('--- 早报数据更新完成 ---');
}

function extractStat(body, label) {
    const regex = new RegExp(`${label}[：:]\\s*(.*?)(?=\\n|$)`, 'i');
    const match = body.match(regex);
    if (!match) return '';
    return match[1].trim().replace(/⭐/g, '').trim();
}

function isEnglish(text) {
    return !/[\u4e00-\u9fa5]/.test(text);
}

fetchAll();
