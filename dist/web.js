"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const releases_1 = require("./releases");
const webDir = 'web';
const pack = process.env.PACK_ID;
const api = axios_1.default.create({
    baseURL: (_a = process.env.API_URL) !== null && _a !== void 0 ? _a : 'https://packs.macarena.ceo/api',
    headers: {
        'Content-Type': 'application/json'
    }
});
async function updateWeb(release) {
    const cfData = JSON.parse(fs_1.readFileSync('minecraftinstance.json').toString());
    const packData = fs_1.existsSync(path_1.join(webDir, 'pack.yml')) && yaml_1.default.parse(fs_1.readFileSync(path_1.join(webDir, 'pack.yml')).toString());
    const tag = release.tag_name;
    await Promise.all([
        api.put(`/pack/${pack}/${tag}`, { ...cfData, ...packData, ...releases_1.strip(release) }).then(() => console.log(`Updated pack`)),
        updatePages(),
        updateAssets(),
    ]);
}
exports.default = updateWeb;
async function updateAssets() {
    const assetsDir = path_1.join(webDir, 'assets');
    if (!fs_1.existsSync(assetsDir)) {
        console.warn('No assets defined');
        return;
    }
    const assets = fs_1.readdirSync(assetsDir).map(f => path_1.join(assetsDir, f));
    const assetsData = assets.reduce((data, img) => {
        data.append(path_1.basename(img), fs_1.createReadStream(img));
        return data;
    }, new form_data_1.default());
    await api.put(`/pack/${pack}/assets`, assetsData, { headers: assetsData.getHeaders() });
    console.log(`Updated assets`);
}
function updatePages() {
    const pageDir = path_1.join(webDir, 'pages');
    if (!fs_1.existsSync(pageDir)) {
        console.warn('No pages defined');
        return;
    }
    const pages = fs_1.readdirSync(pageDir).map(f => path_1.join(pageDir, f));
    const parsed = pages.map(page => {
        const ext = path_1.extname(page);
        const content = fs_1.readFileSync(page).toString();
        switch (ext) {
            case '.json': return JSON.parse(content);
            case '.yml': return yaml_1.default.parse(content);
            default: return {};
        }
    });
    return Promise.all(parsed.map(async (content) => {
        await api.put('pack/page', { ...content, pack });
        console.log(`Uploaded ${content.title}`);
    }));
}
//# sourceMappingURL=web.js.map