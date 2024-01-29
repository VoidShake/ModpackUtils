import { getInput, info, setFailed } from '@actions/core'
import { WebService } from '@voidshake/modpack-cli'
import { getReleaseData } from './release'

async function run() {
   const release = getReleaseData()
   const web = new WebService({
      params: [],
      webToken: getInput('web_token', { required: true }),
      apiUrl: getInput('api_url') || undefined,
      modrinthToken: getInput('modrinth_token') || undefined,
      curseforgeToken: getInput('curseforge_token') || undefined,
      ...release,
   })

   await web.updateWeb()

   if (release) {
      info(`found release ${release.version}`)
      await web.parseAndCreateRelease()
   }
}

run().catch(error => {
   if (error instanceof Error) {
      setFailed(error)
   }
})
