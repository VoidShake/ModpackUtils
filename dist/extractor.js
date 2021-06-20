"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cpy_1 = __importDefault(require("cpy"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf_1 = __importDefault(require("rimraf"));
async function extract(from, to, predicate) {
    const out = path_1.resolve(to);
    const packs = fs_1.readdirSync(from)
        .filter(p => !predicate || predicate(p))
        .map(f => path_1.join(from, f));
    const archives = ['zip', 'jar'].map(e => `.${e}`);
    const zips = packs.filter(f => fs_1.statSync(f).isFile() && archives.includes(path_1.extname(f)));
    const dirs = packs.filter(f => fs_1.statSync(f).isDirectory());
    await new Promise((res, rej) => rimraf_1.default(out, e => {
        if (e)
            rej(e);
        else
            res();
    }));
    fs_1.mkdirSync(out, { recursive: true });
    for (const pack of dirs) {
        await Promise.all(['assets', 'data'].map(dir => {
            if (fs_1.existsSync(path_1.join(pack, dir)))
                return cpy_1.default(dir, out, { parents: true, cwd: pack });
        }));
        console.log(`Copied ${path_1.basename(pack)}`);
    }
    for (const pack of zips) {
        await extract_zip_1.default(pack, { dir: out });
        console.log(`Unzipped ${path_1.basename(pack)}`);
    }
}
exports.default = extract;
//# sourceMappingURL=extractor.js.map