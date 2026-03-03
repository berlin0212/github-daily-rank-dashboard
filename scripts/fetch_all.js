import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from '@vitalets/google-translate-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_RANK_URL = 'https://raw.githubusercontent.com/OpenGithubs/github-daily-rank/main/README.md';
const OUTPUT_FILE = path.join(__dirname, '../src/data.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAll() {
    console.log('--- 开始整理科技早报 ---');
    const result = {
        githubRank: [],
        hackerNews: [],
        updateTime: new Date().toLocaleString()
    };

    // 1. 获取 GitHub Ranking (Top 10)
    try {
        console.log('1/2 正在拉取 GitHub 排名 (Top 10)...');
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
                try {
                    await sleep(1000); 
                    const trans = await translate(project.description, { to: 'zh-CN' });
                    project.description = trans.text;
                } catch (err) {
                    console.log(`项目 ${project.name} 翻译跳过`);
                }
            }
            result.githubRank.push(project);
            if (result.githubRank.length >= 10) break;
        }
    } catch (e) { console.error('GitHub Rank 获取失败', e.message); }

    // 2. 获取 Hacker News (Top 10)
    try {
        console.log('2/2 正在获取 Hacker News (Top 10)...');
        const topStories = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = topStories.data.slice(0, 10);
        for (const id of ids) {
            try {
                const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 });
                if (story.data && story.data.title) {
                    let title = story.data.title;
                    let translatedTitle = title;
                    try {
                        await sleep(1500); 
                        const trans = await translate(title, { to: 'zh-CN' });
                        translatedTitle = trans.text;
                    } catch(err) {
                        console.log(`HN ID ${id} 标题翻译跳过`);
                    }
                    result.hackerNews.push({
                        title: translatedTitle,
                        originalTitle: title,
                        url: story.data.url || `https://news.ycombinator.com/item?id=${id}`,
                        score: story.data.score
                    });
                }
            } catch (err) {
                console.error(`获取 HN 项目失败 ID: ${id}`);
            }
        }
    } catch (e) { console.error('Hacker News 获取失败', e.message); }

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
