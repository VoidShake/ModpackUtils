import { endGroup, getInput, info, startGroup } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import axios from 'axios'
import unzip from 'extract-zip'
import { createWriteStream, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { getReleases } from './releases'
import { createRelease } from './web'

export async function backtrackReleases() {
   const { repo, owner } = context.repo

   const releases = await getReleases()

   startGroup('Importing releases')

   const github = getOctokit(getInput('github_token', { required: true }))

   mkdirSync('temp', { recursive: true })
   await Promise.all(releases.map(async release => {

      const dir = resolve('temp', release.tag_name)
      const zip = dir + '.zip'

      const { url } = await github.rest.repos.downloadZipballArchive({
         owner, repo, ref: release.tag_name,
      })

      const { data } = await axios.get(url, { responseType: 'stream' })
      const writer = createWriteStream(zip)
      data.pipe(writer)

      await new Promise((res, rej) => {
         writer.on('finish', res)
         writer.on('error', rej)
      })

      await unzip(zip, { dir })

      const gitDir = readdirSync('dir')[0]
      console.log(readdirSync(join(dir, gitDir)).join(', '))

      if (false) await createRelease(release, join(dir, gitDir))

      info(`Uploaded ${release.tag_name}`)

   }))

   endGroup

}