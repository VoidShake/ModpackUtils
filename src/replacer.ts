import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import glob from 'glob'
import { dirname, join } from 'path'
import extrator from './extractor'

function capitalize(s: string) {
   return s.substring(0, 1).toUpperCase() + s.substring(1)
}

export default async function replaceContent() {

   const file = 'replaced.json'

   if (!existsSync(file)) {
      console.warn('Skipping resource replacer')
      return
   }

   const replaced: Array<[string, string]> = Object.entries(JSON.parse(readFileSync(file).toString()))
   const sources = replaced.map(a => a.map(it => it.split(':')[0])).reduce<string[]>((a, b) => [...a, ...b], [])

   const dataRegex = replaced.map(([from, to]) => {
      const [modFrom, idFrom] = from.split(':')
      const [modTo, idTo] = to.split(':')
      return [new RegExp(`${modFrom}:((?:.+/)*)${idFrom}`, 'g'), `${modTo}:$1${idTo}`] as [RegExp, string]
   })

   const assetsRegex = replaced.map(([from, to]) => {
      const [modFrom, idFrom] = from.split(':')
      const [modTo, idTo] = to.split(':')
      return [new RegExp(`\/${modFrom}\/(.+)\/${idFrom}\.json$`), `/${modTo}/$1/${idTo}.json`] as [RegExp, string]
   })

   const langRegex = replaced.map(([from, to]) => {
      const [modFrom, idFrom] = from.split(':')
      const [modTo, idTo] = to.split(':')
      return [new RegExp(`^(.+)\\.${modFrom}\\.${idFrom}$`, 'g'), `$1.${modTo}.${idTo}`] as [RegExp, string]
   })

   const isSource = (f: string) => {
      return sources.some(s => f.toLowerCase().includes(s))
   }

   const temp = 'temp'
   const out = join('resources', 'replaced')

   await extrator('mods', temp, isSource)

   replaceOccurences(temp, out, [
      'data/*/recipes/**/*.json',
      'data/*/loot_tables/**/*.json',
   ])

   mimic(temp, out, [
      'assets/*/blockstates/**/*.json',
      'assets/*/models/item/**/*.json',
   ])

   replaceTranslations(temp, out, [
      'block', 'item'
   ])

   function replaceTranslations(dir: string, out: string, types: string[]) {

      const translations = glob.sync(`${dir}/assets/*/lang/en_us.json`)
         .map(s => readFileSync(s).toString())
         .map(s => {
            try {
               return JSON.parse(s)
            } catch {
               return {}
            }
         })
         .reduce((a, b) => ({ ...a, ...b }), {})

      const namespaces = replaced
         .map(([from]) => from.split(':')[0])
         .filter((n1, i1, a) => !a.some((n2, i2) => i2 < i1 && n1 === n2))

      const translationsOut = langRegex.map(([from, to]) => {

         const replaceKeys = Object.keys(translations).filter(k => from.test(k))

         return replaceKeys
            .filter(key => types.some(t => key.startsWith(t)))
            .reduce((o, fromKey) => {

               const toKey = fromKey.replace(from, to)
               const assumed = toKey.substring(toKey.lastIndexOf('.') + 1)

               return {
                  ...o,
                  [fromKey]: translations[toKey] ?? capitalize(assumed)
               }

            }, {})

      }).reduce((a, b) => ({ ...a, ...b }), {})

      namespaces.forEach(mod => {

         const outDir = join(out, 'assets', mod, 'lang')
         mkdirSync(outDir, { recursive: true })
         writeFileSync(join(outDir, 'en_us.json'), JSON.stringify(translationsOut, null, 2))

      })

      console.log('Updated translations')

   }

   function replaceOccurences(dir: string, out: string, replaceable: string[]) {

      const matches = replaceable.reduce((a, s) =>
         [...a, ...glob.sync(s, { cwd: dir })],
         [] as string[]
      )

      matches.forEach(s => replace(
         join(dir, s),
         join(out, s)
      ))

      console.log('Replaced occurencies')

   }

   function mimic(dir: string, out: string, replaceable: string[]) {

      const matches = replaceable.reduce((a, s) =>
         [...a, ...glob.sync(s, { cwd: dir })],
         [] as string[]
      )

      assetsRegex.forEach(([from, to]) => {

         const files = matches.filter(f => from.test(f))

         files.forEach(file => {

            const match = join(dir, file.replace(from, to))
            const outFile = join(out, file)

            if (existsSync(match)) {
               mkdirSync(dirname(outFile), { recursive: true })
               copyFileSync(match, outFile)
            } else {
               console.warn('Using assets replacing for', match)
               replace(join(dir, file), outFile)
            }

         })

      })

      console.log('Mimiced assets')

   }

   function replace(file: string, to: string) {
      const content = readFileSync(file).toString()

      const replacedContent = dataRegex.reduce(
         (s, [from, to]) => s.replace(from, to),
         content
      )

      if (content !== replacedContent) {
         mkdirSync(dirname(to), { recursive: true })
         writeFileSync(to, replacedContent)
      }

   }

}