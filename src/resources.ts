import { existsSync } from 'fs'
import extrator from './extractor'

export default function extractResources() {
   if(existsSync('resources')) return extrator('resources', 'temp')
   else console.warn('Skipping resources')
}
