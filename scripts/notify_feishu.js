import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;
const DATA_FILE = path.join(__dirname, '../src/data.json');

async function sendToFeishu() {
    if (!WEBHOOK_URL) {
        console.error('错误: 请设置环境变量 FEISHU_WEBHOOK_URL');
        return;
    }

    if (!fs.existsSync(DATA_FILE)) {
        console.error('错误: 数据文件不存在，请先运行 fetch_data.js');
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        const dateStr = new Date().toISOString().split('T')[0];

        // 构造飞书卡片消息 (突出内容，弱化指标)
        const card = {
            header: {
                template: "grey", // 改用灰色顶栏，沉浸感更强
                title: {
                    content: `GitHub 今日流行趋势精选 (${dateStr})`,
                    tag: "plain_text"
                }
            },
            elements: []
        };

        data.slice(0, 10).forEach((project, index) => {
            // 1. 项目标题 (弱化索引，突出名字)
            card.elements.push({
                tag: "div",
                text: {
                    content: `${index + 1}. **[${project.name}](${project.url})**`,
                    tag: "lark_md"
                }
            });

            // 2. 核心简介 (清晰呈现，使用正文样式)
            card.elements.push({
                tag: "div",
                text: {
                    content: project.description || '暂无详细描述',
                    tag: "lark_md"
                }
            });

            // 3. 次要指标 (弱化，放在描述下方，使用 Note 样式)
            card.elements.push({
                tag: "note",
                elements: [
                    {
                        tag: "plain_text",
                        content: `⭐ Stars: ${project.totalStars}   |   🔥 Growth: +${project.dailyGrowth}`
                    }
                ]
            });

            // 分割线
            if (index < 9) {
                card.elements.push({ tag: "hr" });
            }
        });

        // 底部脚注
        card.elements.push({
            tag: "note",
            elements: [
                { tag: "plain_text", content: "💡 本简报由 AI 秘书自动翻译及推送 | 祝您今天充满灵感" }
            ]
        });

        const payload = {
            msg_type: "interactive",
            card: card
        };

        const response = await axios.post(WEBHOOK_URL, payload);
        if (response.data.StatusCode === 0 || response.data.code === 0) {
            console.log('飞书优化卡片推送成功！');
        } else {
            console.error('飞书推送失败:', response.data);
        }

    } catch (error) {
        console.error('推送过程中出现异常:', error.message);
    }
}

sendToFeishu();
