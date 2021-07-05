import * as core from '@actions/core';
import * as github from '@actions/github';
import { AxiosError } from 'axios';
import { backtrackReleases } from './importer';
import technicRelease from './technic';
import { createRelease, updateWeb } from './web';

function isAxiosError(e: any): e is AxiosError {
   return !!e.isAxiosError
}


async function run() {

   const action = core.getInput('action', { required: true })

   switch (action) {
      case 'web': return web()
      case 'technic': return technicRelease()
      case 'import': return importer()
   }

   throw new Error(`Invalid action '${action}'`)

}

async function importer() {
   await updateWeb()
   await backtrackReleases()
}

async function web() {

   if (github.context.eventName === 'release') {
      const release = await createRelease(github.context.payload.release)
      core.setOutput('release', release)
   }

   await updateWeb()

}

run().catch(e => {

   if (isAxiosError(e)) {
      core.error(`API Request failed: ${e.config.url}`)
      core.error(`   ${e.response?.data}`)
      throw e
   }

   core.setFailed(e.message)

})