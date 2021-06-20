"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const dotenv_1 = require("dotenv");
const web_1 = __importDefault(require("./web"));
dotenv_1.config();
async function run() {
    const action = core.getInput('action');
    switch (action) {
        case 'web': return web();
    }
    throw new Error(`Invalid action '${action}'`);
}
async function web() {
    const { eventName } = github.context;
    if (eventName !== 'release' || !github.context.payload.release) {
        throw new Error('web workflow can only be triggered at release creation');
    }
    return web_1.default(github.context.payload.release);
}
run().catch(e => core.setFailed(e.message));
//# sourceMappingURL=index.js.map