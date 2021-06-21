import cpy from 'cpy'
import { existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import extrator from './extractor'

export default async function extractResources() {
   if (existsSync('resources')) {
      await extrator('resources', 'temp')
      mkdirSync('kubejs', { recursive: true })
      await Promise.all(['assets', 'data'].map(dir => {
         if (existsSync(join('temp', dir))) return cpy(dir, resolve('kubejs'), { parents: true, cwd: 'temp' })
      }))
   }
   else console.warn('Skipping resources')
}
