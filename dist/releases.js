"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelease = exports.strip = exports.getReleases = void 0;
const github_1 = require("@actions/github");
//const { repo, actor } = context
const repo = 'SteampunkAndDragons';
const actor = 'Frozenpacks';
async function getReleases() {
    var _a;
    const github = github_1.getOctokit((_a = process.env.GITHUB_TOKEN) !== null && _a !== void 0 ? _a : '');
    const response = await github.request(`/repos/${actor}/${repo}/releases`);
    return response.data.map(strip);
}
exports.getReleases = getReleases;
function strip(raw) {
    const { html_url, tag_name, name, published_at, body } = raw;
    return {
        name,
        url: html_url,
        version: tag_name,
        date: published_at,
        changelog: body
    };
}
exports.strip = strip;
async function getRelease(tag) {
    var _a;
    const github = github_1.getOctokit((_a = process.env.GITHUB_TOKEN) !== null && _a !== void 0 ? _a : '');
    const response = await github.request(`/repos/${actor}/${repo}/releases/tags/${tag}`);
    return strip(response.data);
}
exports.getRelease = getRelease;
//# sourceMappingURL=releases.js.map