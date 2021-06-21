import cpy from 'cpy'
import { existsSync, mkdirSync } from 'fs'
import extrator from './extractor'

export default async function extractResources() {
   if (existsSync('resources')) {
      await extrator('resources', 'temp')
      mkdirSync('kubejs', { recursive: true })
      await cpy(['temp/assets', 'temp/data'], 'kubejs')
   }
   else console.warn('Skipping resources')
}
