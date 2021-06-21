import { existsSync, readdirSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";

export default function removeClientContent() {

   const file = 'client-only.json'
   if (existsSync(file)) {

      const remove: string[] = JSON.parse(readFileSync(file).toString())

      const matches = readdirSync('mods').filter(file => remove.some(s => file.includes(s)))

      matches.forEach(f => {
         unlinkSync(join('mods', f))
      })

      console.log('Removed', matches.length, 'files using', remove.length, 'patterns')

   }
}