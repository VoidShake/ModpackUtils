import { context, getOctokit } from '@actions/github'

export interface RawRelease {
   body: string,
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



export async function getReleases() {
   const { repo, owner } = context.repo
   const octokit = getOctokit(process.env.GITHUB_TOKEN ?? '')
   const response = await octokit.request(`/repos/${owner}/${repo}/releases`)
   return response.data as RawRelease[]
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