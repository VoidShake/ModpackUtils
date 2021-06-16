import * as core from '@actions/core';
import * as github from '@actions/github';
import { config } from "dotenv/types";

config()

async function run() {

   const action = core.getInput('action')

   switch (action) {
      case 'web': console.log(github.context)
   }

}

run().catch(e => core.setFailed(e.message));