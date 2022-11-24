import { getInput, setFailed } from '@actions/core'
import { Action, CurseforgeService, defaultPaths, WebOptions, WebService } from '@voidshake/modpack-cli'
import { getReleaseData } from './release'

async function run() {
   const actions = getInput('actions', { required: true })
      .split(',')
      .map(it => it.trim().toLowerCase())

   const release = getReleaseData()

   const webOptions = (required: boolean): WebOptions => ({
      webToken: getInput('web_token', { required }),
      apiUrl: getInput('api_url') || undefined,
   })

   if (actions.includes(Action.CURSEFORGE)) {
      if (!release) throw new Error('curseforge action can only be triggered on release')

      const curseforge = new CurseforgeService({
         ...webOptions(false),
         curseforgeToken: getInput('curseforge_token', { required: true }),
         curseforgeProject: Number.parseInt(getInput('curseforge_project', { required: true })),
         paths: defaultPaths,
      })

      await curseforge.createRelease(release)
   }

   if (actions.includes(Action.WEB)) {
      const web = new WebService(webOptions(true))

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
