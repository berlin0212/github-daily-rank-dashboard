import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from '@vitalets/google-translate-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_URL = 'https://raw.githubusercontent.com/OpenGithubs/github-daily-rank/main/README.md';
const OUTPUT_FILE = path.join(__dirname, '../src/data.json');

async function fetchData() {
    try {
        console.log('正在拉取最新的 GitHub 排名数据...');
        const response = await axios.get(DATA_URL);
        const mdContent = response.data;

        // 正则表达式匹配项目详情块
        const projectRegex = /<h3[^>]*>.*?(\d+)\.\s+(https:\/\/github\.com\/[^\s<]+).*?<\/h3>([\s\S]*?)(?=<h3|---|$)/g;
        const projects = [];
        let match;

        while ((match = projectRegex.exec(mdContent)) !== null) {
            const rank = parseInt(match[1]);
            const url = match[2];
            const name = url.replace('https://github.com/', '');
            const body = match[3];

            const stats = {
                rank,
                name,
                url,
                totalStars: extractStat(body, '总星标数量'),
                dailyGrowth: extractStat(body, '日增长数量'),
                weeklyGrowth: extractStat(body, '上周增长数量'),
                monthlyGrowth: extractStat(body, '上月增长数量'),
                releaseDate: extractStat(body, '开源时间'),
                description: extractStat(body, '项目描述')
            };

            projects.push(stats);
        }

        console.log(`成功解析 ${projects.length} 个项目。正在进行翻译...`);

        // 自动翻译描述
        for (const project of projects) {
            if (project.description && isEnglish(project.description)) {
                try {
                    const res = await translate(project.description, { to: 'zh-CN' });
                    project.description = res.text;
                } catch (err) {
                    console.error(`翻译 ${project.name} 失败:`, err.message);
                }
            }
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));
        console.log('数据更新完成！已保存至 src/data.json');

    } catch (error) {
        console.error('更新失败:', error.message);
    }
}

function extractStat(body, label) {
    const regex = new RegExp(`${label}[：:]\\s*(.*?)(?=\\n|$)`, 'i');
    const match = body.match(regex);
    if (!match) return '';
    let val = match[1].trim();
    // 移除末尾的 ⭐ 符号
    return val.replace(/⭐/g, '').trim();
}

function isEnglish(text) {
    // 简单的英文判定：不包含中文字符即判定为英文
    return !/[\u4e00-\u9fa5]/.test(text);
}

fetchData();