"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const glob_1 = __importDefault(require("glob"));
const path_1 = require("path");
const extractor_1 = __importDefault(require("./extractor"));
function replaceContent() {
    const file = path_1.join(__dirname, '..', 'replaced.json');
    const replaced = Object.entries(JSON.parse(fs_1.readFileSync(file).toString()));
    const dataRegex = replaced.map(([from, to]) => {
        const [modFrom, idFrom] = from.split(':');
        const [modTo, idTo] = to.split(':');
        return [new RegExp(`${modFrom}:((?:.+/)*)${idFrom}`, 'g'), `${modTo}:$1${idTo}`];
    });
    const assetsRegex = replaced.map(([from, to]) => {
        const [modFrom, idFrom] = from.split(':');
        const [modTo, idTo] = to.split(':');
        return [new RegExp(`\/${modFrom}\/(.+)\/${idFrom}\.json$`), `/${modTo}/$1/${idTo}.json`];
    });
    const langRegex = replaced.map(([from, to]) => {
        const [modFrom, idFrom] = from.split(':');
        const [modTo, idTo] = to.split(':');
        return [new RegExp(`^(.+)\\.${modFrom}\\.${idFrom}$`, 'g'), `$1.${modTo}.${idTo}`];
    });
    const isSource = (f) => {
        const sources = ['iceandfire', 'create', 'caverns_and_chasms', 'biomesoplenty', 'environmental', 'abundance', 'autumnity', 'quark', 'cofh_core', 'atmospheric'];
        return sources.some(s => f.toLowerCase().includes(s));
    };
    async function run() {
        const temp = 'temp';
        const out = path_1.join('resources', 'replaced');
        await extractor_1.default('mods', temp, isSource);
        replaceOccurences(temp, out, [
            'data/*/recipes/**/*.json',
            'data/*/loot_tables/**/*.json',
        ]);
        mimic(temp, out, [
            'assets/*/blockstates/**/*.json',
            'assets/*/models/item/**/*.json',
        ]);
        replaceTranslations(temp, out, [
            'block', 'item'
        ]);
    }
    function capitalize(s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
    function replaceTranslations(dir, out, types) {
        const translations = glob_1.default.sync(`${dir}/assets/*/lang/en_us.json`)
            .map(s => fs_1.readFileSync(s).toString())
            .map(s => {
            try {
                return JSON.parse(s);
            }
            catch (_a) {
                return {};
            }
        })
            .reduce((a, b) => ({ ...a, ...b }), {});
        const namespaces = replaced
            .map(([from]) => from.split(':')[0])
            .filter((n1, i1, a) => !a.some((n2, i2) => i2 < i1 && n1 === n2));
        const translationsOut = langRegex.map(([from, to]) => {
            const replaceKeys = Object.keys(translations).filter(k => from.test(k));
            return replaceKeys
                .filter(key => types.some(t => key.startsWith(t)))
                .reduce((o, fromKey) => {
                var _a;
                const toKey = fromKey.replace(from, to);
                const assumed = toKey.substring(toKey.lastIndexOf('.') + 1);
                return {
                    ...o,
                    [fromKey]: (_a = translations[toKey]) !== null && _a !== void 0 ? _a : capitalize(assumed)
                };
            }, {});
        }).reduce((a, b) => ({ ...a, ...b }), {});
        namespaces.forEach(mod => {
            const outDir = path_1.join(out, 'assets', mod, 'lang');
            fs_1.mkdirSync(outDir, { recursive: true });
            fs_1.writeFileSync(path_1.join(outDir, 'en_us.json'), JSON.stringify(translationsOut, null, 2));
        });
        console.log('Updated translations');
    }
    function replaceOccurences(dir, out, replaceable) {
        const matches = replaceable.reduce((a, s) => [...a, ...glob_1.default.sync(s, { cwd: dir })], []);
        matches.forEach(s => replace(path_1.join(dir, s), path_1.join(out, s)));
        console.log('Replaced occurencies');
    }
    function mimic(dir, out, replaceable) {
        const matches = replaceable.reduce((a, s) => [...a, ...glob_1.default.sync(s, { cwd: dir })], []);
        assetsRegex.forEach(([from, to]) => {
            const files = matches.filter(f => from.test(f));
            files.forEach(file => {
                const match = path_1.join(dir, file.replace(from, to));
                const outFile = path_1.join(out, file);
                if (fs_1.existsSync(match)) {
                    fs_1.mkdirSync(path_1.dirname(outFile), { recursive: true });
                    fs_1.copyFileSync(match, outFile);
                }
                else {
                    console.warn('Using assets replacing for', match);
                    replace(path_1.join(dir, file), outFile);
                }
            });
        });
        console.log('Mimiced assets');
    }
    function replace(file, to) {
        const content = fs_1.readFileSync(file).toString();
        const replacedContent = dataRegex.reduce((s, [from, to]) => s.replace(from, to), content);
        if (content !== replacedContent) {
            fs_1.mkdirSync(path_1.dirname(to), { recursive: true });
            fs_1.writeFileSync(to, replacedContent);
        }
    }
}
exports.default = replaceContent;
//# sourceMappingURL=replacer.js.map