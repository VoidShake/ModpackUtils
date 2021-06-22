import { warning } from '@actions/core'
import cpy from 'cpy'
import { existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import extrator from './extractor'

export default async function extractResources() {
   if (existsSync('resources')) {
      await extrator('resources', 'temp')
      mkdirSync('kubejs', { recursive: true })
      await cpy(['assets', 'data'], resolve('kubejs'), { parents: true, cwd: 'temp' })
   }
   else warning('Skipping resources')
}
