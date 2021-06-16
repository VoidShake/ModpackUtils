import axios from 'axios'
import FormData from 'form-data'
import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs'
import { basename, extname, join } from 'path'
import yaml from 'yaml'
import { getRelease } from './releases'

export default async function updateWeb(tag: string) {

   const webDir = 'web'
   const cfData = JSON.parse(readFileSync('minecraftinstance.json').toString())
   const packData = existsSync(join(webDir, 'pack.yml')) && yaml.parse(readFileSync(join(webDir, 'pack.yml')).toString())

   const api = axios.create({
      baseURL: process.env.API_URL ?? 'https://packs.macarena.ceo/api',
      headers: {
         'Content-Type': 'application/json'
      }
   })

   const pack = process.env.PACK_ID

   const pages = readdirSync(join(webDir, 'pages')).map(f => join(webDir, 'pages', f))
   const assets = readdirSync(join(webDir, 'assets')).map(f => join(webDir, 'assets', f))
   const assetsData = assets.reduce((data, img) => {
      data.append(basename(img), createReadStream(img))
      return data
   }, new FormData())

   const parsed = pages.map(page => {
      const ext = extname(page)
      const content = readFileSync(page).toString()
      switch (ext) {
         case '.json': return JSON.parse(content)
         case '.yml': return yaml.parse(content)
         default: return {}
      }
   })

   const releaseData = tag && await getRelease(tag)

   await Promise.all([
      api.put(`/pack/${pack}/${tag}`, { ...cfData, ...packData, ...releaseData }).then(() => console.log(`Updated pack`)),
      ...parsed.map(async content => {
         await api.put('pack/page', { ...content, pack })
         console.log(`Uploaded ${content.title}`)
      }),
      api.put(`/pack/${pack}/assets`, assetsData, { headers: assetsData.getHeaders() }).then(() => console.log(`Updated assets`)),
   ])

}