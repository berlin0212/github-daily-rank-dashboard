import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;
const DATA_FILE = path.join(__dirname, '../src/data.json');

async function sendToFeishu() {
    if (!WEBHOOK_URL) return;

    try {
        const fullData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        const dateStr = new Date().toISOString().split('T')[0];

        const card = {
            header: {
                template: "blue",
                title: { content: `🌌 科技早报 | ${dateStr}`, tag: "plain_text" }
            },
            elements: []
        };

        // --- SECTION: GITHUB TRENDING ---
        card.elements.push({
            tag: "div",
            text: { content: "🔥 **GitHub 热门趋势 (Top 5)**", tag: "lark_md" }
        });

        fullData.githubRank.slice(0, 5).forEach((p, i) => {
            card.elements.push({
                tag: "div",
                text: { content: `${i + 1}. **[${p.name}](${p.url})**\n${p.description}`, tag: "lark_md" }
            });
            card.elements.push({
                tag: "note",
                elements: [{ tag: "plain_text", content: `⭐ Stars: ${p.totalStars} | 今日增长: +${p.dailyGrowth}` }]
            });
        });

        card.elements.push({ tag: "hr" });

        // --- SECTION: HACKER NEWS ---
        card.elements.push({
            tag: "div",
            text: { content: "📰 **Hacker News 精选讨论**", tag: "lark_md" }
        });

        fullData.hackerNews.slice(0, 3).forEach((n, i) => {
            card.elements.push({
                tag: "div",
                text: { content: `• **[${n.title}](${n.url})**`, tag: "lark_md" }
            });
        });

        card.elements.push({ tag: "hr" });

        // --- SECTION: AI NEWS ---
        if (fullData.aiNews && fullData.aiNews.length > 0) {
            card.elements.push({
                tag: "div",
                text: { content: "🤖 **AI & 科学前沿动态**", tag: "lark_md" }
            });
            fullData.aiNews.slice(0, 3).forEach((n, i) => {
                card.elements.push({
                    tag: "div",
                    text: { content: `• [${n.title}](${n.url || '#'})`, tag: "lark_md" }
                });
            });
        }

        card.elements.push({
            tag: "note",
            elements: [{ tag: "plain_text", content: "💡 每日早上 9 点准时送达 | 保持好奇心" }]
        });

        const payload = { msg_type: "interactive", card: card };
        const response = await axios.post(WEBHOOK_URL, payload);
        if (response.data.StatusCode === 0 || response.data.code === 0) {
            console.log('超级科技早报推送成功！');
        } else {
            console.error('推送失败:', response.data);
        }

    } catch (e) { console.error('推送异常:', e.message); }
}

sendToFeishu();
