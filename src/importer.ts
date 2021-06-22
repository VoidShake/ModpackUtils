import { endGroup, getInput, info, startGroup } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { mkdirSync } from 'fs'
import { resolve } from 'path'
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

      const url = await github.rest.repos.downloadZipballArchive({
         owner, repo, ref: release.tag_name,
      })

      console.log(url)

      if (false) await createRelease(release, dir)

      info(`Uploaded ${release.tag_name}`)

   }))

   endGroup

}