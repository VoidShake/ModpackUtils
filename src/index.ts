import * as core from '@actions/core';
import * as github from '@actions/github';
import { config } from "dotenv";
import updateWeb from './web';

config()

async function run() {

   const action = core.getInput('action')

   switch (action) {
      case 'web': return web()
   }

   throw new Error(`Invalid action '${action}'`)

}

async function web() {
   const { eventName } = github.context

   if (eventName !== 'release' || !github.context.payload.release) {
      throw new Error('web workflow can only be triggered at release creation')
   }

   return updateWeb(github.context.payload.release)
}

run().catch(e => core.setFailed(e.message));