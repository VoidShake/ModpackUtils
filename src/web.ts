import * as core from '@actions/core'
import axios from 'axios'
import FormData from 'form-data'
import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs'
import { basename, extname, join } from 'path'
import yaml from 'yaml'
import { RawRelease, strip } from './releases'

const webDir = 'web'
const token = core.getInput('web_token')

const api = axios.create({
   baseURL: core.getInput('api'),
   headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
   }
})

export async function updateWeb() {

   await Promise.all([
      ...updatePages(),
      updateData(),
      updateAssets(),
   ])

}

async function updateData() {
   const file = join(webDir, 'pack.yml')
   if (!existsSync(file)) {
      console.warn('Skip updating pack data')
      return
   }

   const packData = yaml.parse(readFileSync(file).toString())

   await api.put(`/pack`, packData)
   console.log('Updated pack data')
}

export async function createRelease(release: RawRelease) {
   const tag = release.tag_name

   const cfFile = 'minecraftinstance.json'
   if (!cfFile) throw new Error('minecraftinstance.json file missing')

   const cfData = JSON.parse(readFileSync(cfFile).toString())
   api.put(`/pack/release/${tag}`, { ...cfData, ...strip(release) })

   console.log(`Created release for version '${tag}'`)
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