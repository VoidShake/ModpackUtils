import * as core from "@actions/core";
import curseforgeRelease from "./curseforge";
import { logError } from "./error";
import { backtrackReleases } from "./importer";
import { getRelease } from "./inputs";
import technicRelease from "./technic";
import { createRelease, updateWeb } from "./web";

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
  logError(e);
  core.setFailed(e.message);
});
