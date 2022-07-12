import {
  endGroup,
  error,
  getInput,
  info,
  startGroup,
  warning,
} from "@actions/core";
import { context, getOctokit } from "@actions/github";
import archiver from "archiver";
import axios from "axios";
import FormData from "form-data";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
} from "fs";
import { join } from "path";
import { getPackName, getPackVersion, getRelease } from "./inputs";
import { RawRelease } from "./releases";
import replaceContent from "./replacer";
import extractResources from "./resources";
import removeClientContent from "./server";
import { MinecraftInstance } from "./web";

export default async function curseforgeRelease() {
  startGroup("Creating zip releases for CurseForge");

  await replaceContent();
  await extractResources();

  await zipAndUpload("client");

  removeClientContent();
  await zipAndUpload("server");

  endGroup();
}

function getApi() {
  const token = getInput("curseforge_token", { required: true });

  return axios.create({
    baseURL: "https://minecraft.curseforge.com/api",
    headers: {
      "X-Api-Token": token,
    },
  });
}

async function zipAndUpload(name: string) {
  const release = getRelease();
  if (!release) {
    error("CurseForge uploads can only be triggered on release");
    return;
  }

  const overrides = ["config", "mods", "kubejs", "defaultconfigs"];
  const archive = archiver("zip");
  const file = name + ".zip";

  archive.pipe(createWriteStream(file));
  overrides.forEach((dir) => archive.directory(dir, join("overrides", dir)));

  const manifest = await createManifest();
  archive.append(manifest, { name: "manifest.json" });

  await archive.finalize();

  const data = new FormData();
  data.append("file", createReadStream(file));
  data.append("metadata", {
    changelogType: "markdown",
    changelog: release.body,
    releaseType: release.prerelease ? "alpha" : "release",
  });

  const projectID = getInput("curseforge_project", { required: true });
  const api = getApi();
  await api.post(`projects/${projectID}/upload-file`, { data });

  if (context.eventName === "release") {
    await uploadToRelease(file, release);
  }
}

async function uploadToRelease(file: string, release: RawRelease) {
  const token = getInput("github_token");
  if (!token) {
    warning("Github token missing, not uploading to release");
    return;
  }

  const octokit = getOctokit(token);

  const { owner, repo } = context.repo;

  await octokit.rest.repos.uploadReleaseAsset({
    release_id: release.id,
    owner,
    repo,
    name: `curseforge-${file}`,
    data: readFileSync(file) as any,
    headers: {
      "Content-Type": "application/zip",
    },
  });
}

async function createManifest() {
  const instance = JSON.parse(
    readFileSync("minecraftinstance.json").toString()
  ) as MinecraftInstance;

  const files = instance.installedAddons
    .filter((a) => a.installedFile.categorySectionPackageType !== 3)
    .filter((a) => existsSync(join("mods", a.installedFile.fileName)))
    .map((a) => ({
      projectID: a.addonID,
      fileID: a.installedFile.id,
      required: true,
    }));

  info(`Found ${files.length} installed mods`);

  const manifest = {
    minecraft: {
      version: instance.baseModLoader.minecraftVersion,
      modLoaders: [
        {
          id: instance.baseModLoader.name,
          primary: true,
        },
      ],
    },
    files,
    manifestType: "minecraftModpack",
    manifestVersion: 1,
    name: await getPackName(),
    version: getPackVersion(),
    author: "possible_triangle",
    overrides: "overrides",
  };

  return JSON.stringify(manifest, null, 2);
}
