import * as core from "@actions/core";
import { AxiosError } from "axios";
import curseforgeRelease from "./curseforge";
import { backtrackReleases } from "./importer";
import { getRelease } from "./inputs";
import technicRelease from "./technic";
import { createRelease, updateWeb } from "./web";

function isAxiosError(e: any): e is AxiosError {
  return !!e.isAxiosError;
}

async function run() {
  const action = core.getInput("action", { required: true });

  switch (action) {
    case "web":
      return web();
    case "technic":
      return technicRelease();
    case "curseforge":
      return curseforgeRelease();
    case "import":
      return importer();
  }

  throw new Error(`Invalid action '${action}'`);
}

async function importer() {
  await updateWeb();
  await backtrackReleases();
}

async function web() {
  const githubRelease = getRelease();
  if (githubRelease) {
    const release = await createRelease(githubRelease);
    core.setOutput("release", release);
  }

  await updateWeb();
}

run().catch((e) => {
  if (isAxiosError(e)) {
    core.error(`API Request failed: ${e.config.url}`);
    core.error(`   ${e.response?.data}`);
  } else {
    core.error(e);
  }

  core.setFailed(e.message);
});
