"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf_1 = __importDefault(require("rimraf"));
const releases_1 = require("./releases");
dotenv_1.config();
async function run() {
    const releases = await releases_1.getReleases();
    fs_1.mkdirSync('temp', { recursive: true });
    await Promise.all(releases.map(async ({ version }) => {
        const dir = path_1.resolve('temp', version);
        if (!fs_1.existsSync(dir)) {
            child_process_1.execSync(`git clone https://github.com/FrozenPacks/SteampunkAndDragons.git "${dir}"`);
        }
        child_process_1.execSync(`git checkout ${version}`, { cwd: dir });
        console.log('Loaded', version);
        child_process_1.execSync(`ts-node "${path_1.resolve(__dirname, 'web')}" ${version}`, { cwd: dir });
        console.log('Uploaded', version);
    }));
    if (false)
        rimraf_1.default.sync('temp/**');
}
run().catch(e => {
    console.error(e.message);
    process.exit(-1);
});
//# sourceMappingURL=backtracker.js.map