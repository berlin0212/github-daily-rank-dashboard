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

        // 构造飞书卡片消息
        const card = {
            header: {
                template: "turquoise",
                title: {
                    content: `📊 GitHub 今日趋势 Top 10 (${dateStr})`,
                    tag: "plain_text"
                }
            },
            elements: []
        };

        data.slice(0, 10).forEach((project, index) => {
            // 项目标题与链接
            card.elements.push({
                tag: "div",
                text: {
                    content: `**${index + 1}. [${project.name}](${project.url})**`,
                    tag: "lark_md"
                }
            });

            // 数据指示器 (两列展示)
            card.elements.push({
                tag: "div",
                fields: [
                    {
                        is_short: true,
                        text: {
                            content: `**⭐ 总星标:**\n${project.totalStars}`,
                            tag: "lark_md"
                        }
                    },
                    {
                        is_short: true,
                        text: {
                            content: `**🔥 今日增长:**\n<font color='red'>+${project.dailyGrowth}</font>`,
                            tag: "lark_md"
                        }
                    }
                ]
            });

            // 项目描述 (灰色小字)
            card.elements.push({
                tag: "note",
                elements: [
                    {
                        tag: "plain_text",
                        content: project.description || '暂无详细描述'
                    }
                ]
            });

            // 分割线 (最后一条除外)
            if (index < 9) {
                card.elements.push({ tag: "hr" });
            }
        });

        // 底部脚注
        card.elements.push({
            tag: "note",
            elements: [
                {
                    tag: "plain_text",
                    content: "💡 每日早上 9 点自动更新 | 由 AI 秘书自动翻译生成"
                }
            ]
        });

        const payload = {
            msg_type: "interactive",
            card: card
        };

        const response = await axios.post(WEBHOOK_URL, payload);
        if (response.data.StatusCode === 0 || response.data.code === 0) {
            console.log('飞书卡片消息推送成功！');
        } else {
            console.error('飞书推送失败:', response.data);
        }

    } catch (error) {
        console.error('推送过程中出现异常:', error.message);
    }
}

sendToFeishu();
