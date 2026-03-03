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

        const postContent = {
            zh_cn: {
                title: `🚀 GitHub Daily Rank - ${dateStr} (精选榜单)`,
                content: []
            }
        };

        data.slice(0, 10).forEach((project, index) => {
            postContent.zh_cn.content.push([
                { tag: "text", text: `${index + 1}. ` },
                { tag: "a", text: project.name, href: project.url }
            ]);
            postContent.zh_cn.content.push([
                { tag: "text", text: `   ⭐ 总星标: ${project.totalStars} | 🔥 今日增长: +${project.dailyGrowth}` }
            ]);
            postContent.zh_cn.content.push([
                { tag: "text", text: `   📝 简介: ${project.description || '无描述'}` },
            ]);
            postContent.zh_cn.content.push([
                { tag: "text", text: ` ` } // 换行
            ]);
        });

        const payload = {
            msg_type: "post",
            content: {
                post: postContent
            }
        };

        const response = await axios.post(WEBHOOK_URL, payload);
        if (response.data.StatusCode === 0 || response.data.code === 0) {
            console.log('飞书推送成功！');
        } else {
            console.error('飞书推送失败:', response.data);
        }

    } catch (error) {
        console.error('推送过程中出现异常:', error.message);
    }
}

sendToFeishu();