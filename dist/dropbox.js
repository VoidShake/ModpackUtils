"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dropbox_1 = require("dropbox");
const fs_1 = require("fs");
const path_1 = require("path");
async function uploadToDropbox(input) {
    const { ACCESS_TOKEN } = process.env;
    const dropbox = new dropbox_1.Dropbox({ accessToken: ACCESS_TOKEN });
    fs_1.readFile(input, async (error, contents) => {
        try {
            if (error)
                throw error;
            const response = await dropbox.filesUpload({
                path: `/${path_1.basename(input)}`, contents, mode: {
                    '.tag': 'overwrite'
                }
            });
            console.log(response);
            process.exit(0);
        }
        catch (e) {
            console.error(e);
            process.exit(-1);
        }
    });
}
exports.default = uploadToDropbox;
//# sourceMappingURL=dropbox.js.map