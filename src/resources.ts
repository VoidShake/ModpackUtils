import cpy from 'cpy'
import { existsSync, mkdirSync } from 'fs'
import extrator from './extractor'

export default async function extractResources() {
   if (existsSync('resources')) {
      await extrator('resources', 'temp')
      mkdirSync('kubejs', { recursive: true })
      await cpy(['assets', 'data'], '../kubejs', { parents: true, cwd: 'temp' })
   }
   else console.warn('Skipping resources')
}
