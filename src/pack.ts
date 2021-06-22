import { info } from "@actions/core"
import { readFileSync, writeFileSync } from "fs"
import { MinecraftInstance } from "./web"

export default function createManifest(version: string) {

   const instance = JSON.parse(readFileSync('minecraftinstance.json').toString()) as MinecraftInstance

   const files = instance.installedAddons
      .filter(a => a.installedFile.categorySectionPackageType !== 3)
      .map(a => ({
         projectID: a.addonID,
         fileID: a.installedFile.id,
         required: true,
      }))

   info(`Found ${files.length} installed mods`)

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
   }

   writeFileSync('manifest.json', JSON.stringify(manifest, null, 2))

}