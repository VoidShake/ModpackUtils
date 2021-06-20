import axios from 'axios'
import FormData from 'form-data'
import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs'
import { basename, extname, join } from 'path'
import yaml from 'yaml'
import { RawRelease, strip } from './releases'

const webDir = 'web'
const pack = process.env.PACK_ID

const api = axios.create({
   baseURL: process.env.API_URL ?? 'https://packs.macarena.ceo/api',
   headers: {
      'Content-Type': 'application/json'
   }
})

export default async function updateWeb(release: RawRelease) {

   const cfData = JSON.parse(readFileSync('minecraftinstance.json').toString())
   const packData = existsSync(join(webDir, 'pack.yml')) && yaml.parse(readFileSync(join(webDir, 'pack.yml')).toString())

   const tag = release.tag_name

   await Promise.all([
      api.put(`/pack/${pack}/${tag}`, { ...cfData, ...packData, ...strip(release) }).then(() => console.log(`Updated pack`)),
      updatePages(),
      updateAssets(),
   ])

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

   await api.put(`/pack/${pack}/assets`, assetsData, { headers: assetsData.getHeaders() })
   console.log(`Updated assets`)
}

function updatePages() {
   const pageDir = join(webDir, 'pages')

   if (!existsSync(pageDir)) {
      console.warn('No pages defined')
      return
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

   return Promise.all(parsed.map(async content => {
      await api.put('pack/page', { ...content, pack })
      console.log(`Uploaded ${content.title}`)
   }))

}