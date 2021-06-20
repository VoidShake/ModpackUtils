"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extractor_1 = __importDefault(require("./extractor"));
const trades_1 = __importDefault(require("./trades"));
function extractResources() {
    extractor_1.default('resources', 'temp').catch(e => {
        console.error(e.message);
        process.exit(-1);
    });
    trades_1.default();
}
exports.default = extractResources;
//# sourceMappingURL=resources.js.map