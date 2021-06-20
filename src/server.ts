import { readdirSync, readFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";

export default function server() {

   const file = resolve(__dirname, '..', 'client-only.json')
   const remove: string[] = JSON.parse(readFileSync(file).toString())

   const matches = readdirSync('mods').filter(file => remove.some(s => file.includes(s)))

   matches.forEach(f => {
      unlinkSync(join('mods', f))
   })

   console.log('Removed', matches.length, 'files using', remove.length, 'patterns')

}