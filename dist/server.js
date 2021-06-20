"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function server() {
    const file = path_1.resolve(__dirname, '..', 'client-only.json');
    const remove = JSON.parse(fs_1.readFileSync(file).toString());
    const matches = fs_1.readdirSync('mods').filter(file => remove.some(s => file.includes(s)));
    matches.forEach(f => {
        fs_1.unlinkSync(path_1.join('mods', f));
    });
    console.log('Removed', matches.length, 'files using', remove.length, 'patterns');
}
exports.default = server;
//# sourceMappingURL=server.js.map