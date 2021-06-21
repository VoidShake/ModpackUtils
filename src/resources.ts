import cpy from 'cpy'
import { existsSync } from 'fs'
import extrator from './extractor'

export default async function extractResources() {
   if (existsSync('resources')) {
      await extrator('resources', 'temp')
      await cpy('temp/*', 'kubejs')
   }
   else console.warn('Skipping resources')
}
