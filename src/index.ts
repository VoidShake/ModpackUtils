import { getInput, setFailed } from '@actions/core'
import { Action, CurseforgeService, defaultPaths, WebService } from '@voidshake/modpack-cli'
import { getReleaseData } from './release'

async function run() {
   const actions = getInput('actions', { required: true })
      .split(',')
      .map(it => it.trim().toLowerCase())

   const release = getReleaseData()

   if (actions.includes(Action.CURSEFORGE)) {
      if (!release) throw new Error('curseforge action can only be triggered on release')

      const curseforge = new CurseforgeService({
         curseforgeToken: getInput('curseforge_token', { required: true }),
         curseforgeProject: Number.parseInt(getInput('curseforge_project', { required: true })),
         paths: defaultPaths,
      })

      await curseforge.createRelease(release)
   }

   if (actions.includes(Action.WEB)) {
      const web = new WebService({
         webToken: getInput('web_token', { required: true }),
         apiUrl: getInput('api_url', { required: false }) || undefined,
      })

      await web.updateWeb()

      if (release) {
         await web.createRelease(release)
      }
   }
}

run().catch(error => {
   if (error instanceof Error) {
      setFailed(error)
   }
})
