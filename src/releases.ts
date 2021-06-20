import { getOctokit } from '@actions/github'

export interface RawRelease {
   body:string,
   html_url: string
   id: number,
   name: string,
   prerelease: boolean,
   published_at: string,
   tag_name: string,
}

export interface Release {
   name: string
   url: string
   version: string
   date: string
   changelog: string
}


//const { repo, actor } = context
const repo = 'SteampunkAndDragons'
const actor = 'Frozenpacks'

export async function getReleases() {
   const github = getOctokit(process.env.GITHUB_TOKEN ?? '')
   const response = await github.request(`/repos/${actor}/${repo}/releases`)
   return response.data.map(strip) as Release[]
}

export function strip(raw: RawRelease): Release {
   const { html_url, tag_name, name, published_at, body } = raw

   return {
      name,
      url: html_url,
      version: tag_name,
      date: published_at,
      changelog: body
   }
}

export async function getRelease(tag: string) {
   const github = getOctokit(process.env.GITHUB_TOKEN ?? '')
   const response = await github.request(`/repos/${actor}/${repo}/releases/tags/${tag}`)
   return strip(response.data)
}
