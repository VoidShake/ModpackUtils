import { info } from "@actions/core";
import { existsSync, readdirSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import rimraf from "rimraf";

export default function removeClientContent() {

   const file = 'client-only.json'

   rimraf.sync('kubejs/assets')

   if (existsSync(file)) {

      const remove: string[] = JSON.parse(readFileSync(file).toString())

      const matches = readdirSync('mods').filter(file => remove.some(s => file.includes(s)))

      matches.forEach(f => {
         unlinkSync(join('mods', f))
      })

      info(`Removed ${matches.length} files using ${remove.length} atterns`)

   }
}