"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function createManifest(version) {
    const instance = JSON.parse(fs_1.readFileSync('minecraftinstance.json').toString());
    const files = instance.installedAddons
        .filter((a) => a.installedFile.categorySectionPackageType !== 3)
        .map((a) => ({
        projectID: a.addonID,
        fileID: a.installedFile.id,
        required: true,
    }));
    console.log(`Found ${files.length} installed mods`);
    const manifest = {
        minecraft: {
            version: '1.16.5',
            modLoaders: [
                {
                    id: 'forge-36.1.0',
                    primary: true
                }
            ]
        },
        files,
        manifestType: 'minecraftModpack',
        manifestVersion: 1,
        name: 'Steampunk & Scales',
        version,
        author: 'possible_triangle',
        overrides: 'overrides'
    };
    fs_1.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
}
exports.default = createManifest;
//# sourceMappingURL=pack.js.map