import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

function generate() {

   overwriteTrades('common', [])
   overwriteTrades('uncommon', [])
   overwriteTrades('rare', tomes({
      'minecraft:feather_falling': 4,
      'minecraft:respiration': 3,
      'minecraft:depth_strider': 3,
      'minecraft:frost_walker': 2,
      'minecraft:soul_speed': 3,
      'minecraft:looting': 3,
      'minecraft:efficiency': 5,
      'minecraft:unbreaking': 3,
      'minecraft:fortune': 3,
      'minecraft:luck_of_the_sea': 3,
      'minecraft:lure': 3,
      'minecraft:loyalty': 3,
      'minecraft:riptide': 3,
      'ensorcellation:gourmand': 2,
      'ensorcellation:reach': 3,
      'ensorcellation:vitality': 3,
      'ensorcellation:excavating': 2,
      'ensorcellation:angler': 2,
      'ensorcellation:furrowing': 4,
      'ensorcellation:tilling': 4,
      'alexsmobs:straddle_jump': 3,
   }))
   overwriteTrades('legendary', [])

   overwriteTrades('common', [], 'vein')
   overwriteTrades('uncommon', [], 'vein')
   overwriteTrades('rare', tomes({
      'minecraft:protection': 4,
      'minecraft:fire_protection': 4,
      'minecraft:blast_protection': 4,
      'minecraft:projectile_protection': 4,
      'minecraft:thorns': 4,
      'minecraft:sharpness': 5,
      'minecraft:smite': 5,
      'minecraft:bane_of_arthropods': 5,
      'minecraft:knockback': 2,
      'minecraft:fire_aspect': 2,
      'minecraft:sweeping': 3,
      'minecraft:power': 5,
      'minecraft:punch': 2,
      'minecraft:impaling': 5,
      'minecraft:quick_charge': 3,
      'minecraft:piercing': 4,
      'farmersdelight:backstabbing': 3,
      'ensorcellation:magic_protection': 4,
      'ensorcellation:displacement': 3,
      'ensorcellation:fire_rebuke': 3,
      'ensorcellation:frost_rebuke': 3,
      'ensorcellation:exp_boost': 3,
      'ensorcellation:damage_ender': 5,
      'ensorcellation:damage_illager': 5,
      'ensorcellation:damage_villager': 5,
      'ensorcellation:cavalier': 3,
      'ensorcellation:frost_aspect': 2,
      'ensorcellation:leech': 4,
      'ensorcellation:magic_edge': 3,
      'ensorcellation:vorpal': 3,
      'ensorcellation:hunter': 2,
      'ensorcellation:quick_draw': 3,
      'ensorcellation:trueshot': 2,
      'ensorcellation:phalanx': 2,
      'spartanshields:spikes': 3,
      'spartanshields:firebrand': 2,
      'spartanshields:payback': 4,
   }), 'vein')
   overwriteTrades('legendary', [], 'vein')
   overwriteTrades('epic', [], 'vein')

}

generate()

function overwriteTrades(rarity: string, trades: unknown[], type?: string) {
   const prefix = type ? `${type}_` : ''
   const tradesDir = join('kubejs', 'data', 'goblintraders', 'trades', prefix + 'goblin_trader')
   const base = join(tradesDir, 'base', `${rarity}.json`)
   const out = join(tradesDir, `${rarity}.json`)

   const hasBase = existsSync(base)
   const baseTrades = hasBase
      ? JSON.parse(readFileSync(base).toString()).trades
      : []

   const content = {
      replace: true,
      trades: [...trades, ...baseTrades],
   }

   writeFileSync(out, JSON.stringify(content, null, 2))

   console.log(`Generated ${rarity} with ${content.trades.length} trades (${baseTrades.length} base trades)`)

}

function tomes(enchantments: Record<string, number>) {
   return Object.entries(enchantments)
      .map(([ench, level]) => tome(ench, level))
}

function tome(ench: string, level: number) {
   return {
      type: 'goblintraders:basic',
      offer_item: {
         item: 'quark:ancient_tome',
         count: 1,
         nbt: `{StoredEnchantments:[{lvl:${level}s,id:"${ench}"}]}`
      },
      payment_item: {
         item: 'minecraft:enchanted_book',
         count: 4,
         nbt: `{StoredEnchantments:[{lvl:${level}s,id:"${ench}"}]}`
      },
      secondary_payment_item: {
         item: 'alexsmobs:mimicream',
         count: 4,
      },
      price_multiplier: 0.5,
      max_trades: 1,
      experience: 100,
   }
}

export default generate