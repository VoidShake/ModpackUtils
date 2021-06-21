import * as core from '@actions/core';
import * as github from '@actions/github';
import archiver from 'archiver';
import { createWriteStream, readFileSync } from 'fs';
import uploadToDropbox from './dropbox';
import { RawRelease } from './releases';
import replaceContent from './replacer';
import extractResources from './resources';
import removeClientContent from './server';

export default async function technicRelease() {

   await replaceContent()
   await extractResources()

   await zipAndUpload('client')

   removeClientContent()
   await zipAndUpload('server')

}

async function zipAndUpload(name: string) {
   const paths = ['config', 'mods', 'kubejs', 'defaultconfigs', 'bin']
   const archive = archiver('zip')
   const file = name + '.zip'

   archive.pipe(createWriteStream(file))
   paths.forEach(dir => archive.directory(dir, dir))
   archive.finalize()

   await uploadToDropbox(file)

   if (github.context.eventName === 'release') {
      await uploadToRelease(file, github.context.payload.release)
   }
}

async function uploadToRelease(file: string, release: RawRelease) {

   const token = core.getInput('github_token')
   if (!token) {
      console.warn('Github token missing, not uploading to release')
      return
   }

   const octokit = github.getOctokit(token)

   const { owner, repo } = github.context.repo

   await octokit.rest.repos.uploadReleaseAsset({
      release_id: release.id,
      owner, repo,
      data: readFileSync(file).toString(),
      name: `technic-${file}`,
      headers: {
         'Content-Type': 'application/zip'
      }
   })

}