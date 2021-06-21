import * as core from '@actions/core'
import axios, { AxiosError } from 'axios'
import FormData from 'form-data'
import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs'
import { basename, extname, join } from 'path'
import yaml from 'yaml'
import { RawRelease, strip } from './releases'

const webDir = 'web'
const token = core.getInput('web_token')

function isAxiosError(e: any): e is AxiosError {
   return !!e.isAxiosError
}

const api = axios.create({
   baseURL: core.getInput('api'),
   headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
   }
})

export default async function updateWeb(release: RawRelease) {

   const tag = release.tag_name
   console.log(`Updating web data for pack for version '${tag}'`)

   const cfData = JSON.parse(readFileSync('minecraftinstance.json').toString())
   const packData = existsSync(join(webDir, 'pack.yml')) && yaml.parse(readFileSync(join(webDir, 'pack.yml')).toString())

   await Promise.all([
      api.put(`/pack/release/${tag}`, { ...cfData, ...packData, ...strip(release) }).then(() => console.log(`Updated pack`)),
      ...updatePages(),
      updateAssets(),
   ].map(p => p.catch(e => {
      if (isAxiosError(e)) {
         console.error(`API Request failed: ${e.config.url}`)
         console.error(`   with token ${token}`)
      }
   })))

}

async function updateAssets() {
   const assetsDir = join(webDir, 'assets')

   if (!existsSync(assetsDir)) {
      console.warn('No assets defined')
      return
   }

   const assets = readdirSync(assetsDir).map(f => join(assetsDir, f))
   const assetsData = assets.reduce((data, img) => {
      data.append(basename(img), createReadStream(img))
      return data
   }, new FormData())

   await api.put(`/pack/assets`, assetsData, { headers: assetsData.getHeaders() })
   console.log(`Updated assets`)
}

function updatePages() {
   const pageDir = join(webDir, 'pages')

   if (!existsSync(pageDir)) {
      console.warn('No pages defined')
      return []
   }

   const pages = readdirSync(pageDir).map(f => join(pageDir, f))

   const parsed = pages.map(page => {
      const ext = extname(page)
      const content = readFileSync(page).toString()
      switch (ext) {
         case '.json': return JSON.parse(content)
         case '.yml': return yaml.parse(content)
         default: return {}
      }
   })

   return parsed.map(async content => {
      await api.put('pack/page', content)
      console.log(`Uploaded ${content.title}`)
   })

}