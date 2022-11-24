import core from '@actions/core'
import { Action, CurseforgeService, defaultPaths, WebService } from '@voidshake/modpack-cli'
import { getReleaseData } from './release'

async function run() {
   const actions = core
      .getInput('actions', { required: true })
      .split(',')
      .map(it => it.trim().toLowerCase())

   const release = getReleaseData()

   if (actions.includes(Action.WEB)) {
      const web = new WebService({
         webToken: core.getInput('web_token', { required: true }),
         apiUrl: core.getInput('api_url'),
      })

      await web.updateWeb()

      if (release) {
         await web.createRelease(release)
      }
   }

   if (actions.includes(Action.CURSEFORGE)) {
      if (!release) throw new Error('curseforge action can only be triggered on release')

      const curseforge = new CurseforgeService({
         curseforgeToken: core.getInput('curseforge_token', { required: true }),
         curseforgeProject: Number.parseInt(core.getInput('curseforge_project', { required: true })),
         paths: defaultPaths,
      })

      await curseforge.createRelease(release)
   }
}

run().catch(error => {
   if (error instanceof Error) {
      core.setFailed(error)
   }
})
