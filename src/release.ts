import { getInput } from '@actions/core'
import { context } from '@actions/github'
import { ReleaseOptions } from '@voidshake/modpack-cli'

interface GithubRelease {
   body: string
   html_url: string
   id: number
   name: string
   prerelease: boolean
   published_at: string
   tag_name: string
   author?: {
      login: string
   }
}

export function getRelease(): GithubRelease | undefined {
   if (context.eventName === 'release') {
      return context.payload.release
   }
}

export function getReleaseData(): ReleaseOptions | undefined {
   const release = getRelease()
   if (!release) return undefined

   const customVersion = getInput('release_version')
   const customType = getInput('release_type')

   return {
      changelog: release.body,
      version: customVersion ?? release.tag_name,
      author: release.author?.login,
      date: release.published_at,
      name: release.name,
      releaseType: customType ?? (release.prerelease ? 'alpha' : 'release'),
      url: release.html_url,
   }
}
