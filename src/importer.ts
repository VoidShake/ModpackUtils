import { context } from '@actions/github'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { getReleases } from './releases'
import { createRelease } from './web'

export async function backtrackReleases() {
   const { repo, owner } = context.repo

   const releases = await getReleases()

   console.group('Importing releases')

   mkdirSync('temp', { recursive: true })
   await Promise.all(releases.map(async release => {

      const dir = resolve('temp', release.tag_name)

      if (!existsSync(dir)) {
         execSync(`git clone https://github.com/${owner}/${repo}.git "${dir}"`)
      }

      execSync(`git checkout ${release.tag_name}`, { cwd: dir })

      await createRelease(release, dir)

      console.log('Uploaded', release.tag_name)

   }))

   console.groupEnd()

}