import { execSync } from 'child_process'
import { config } from 'dotenv'
import { existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import rimraf from 'rimraf'
import { getReleases } from './releases'

config()

async function run() {

   const releases = await getReleases()

   mkdirSync('temp', { recursive: true })
   await Promise.all(releases.map(async ({ version }) => {

      const dir = resolve('temp', version)

      if (!existsSync(dir)) {
         execSync(`git clone https://github.com/FrozenPacks/SteampunkAndDragons.git "${dir}"`)
      }

      execSync(`git checkout ${version}`, { cwd: dir })
      console.log('Loaded', version)

      execSync(`ts-node "${resolve(__dirname, 'web')}" ${version}`, { cwd: dir })

      console.log('Uploaded', version)

   }))

   if (false) rimraf.sync('temp/**')

}

run().catch(e => {
   console.error(e.message)
   process.exit(-1)
})