import { endGroup, getInput, info, startGroup, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import archiver from "archiver";
import { createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getPackName, getPackVersion } from "./inputs";
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

async function zipAndUpload(name: string) {
  createManifest();

  const overrides = ["config", "mods", "kubejs", "defaultconfigs"];
  const archive = archiver("zip");
  const file = name + ".zip";

  archive.pipe(createWriteStream(file));
  overrides.forEach((dir) => archive.directory(dir, join("overrides", dir)));
  await archive.finalize();

  if (context.eventName === "release") {
    await uploadToRelease(file, context.payload.release);
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

function createManifest() {
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
    name: getPackName(),
    version: getPackVersion(),
    author: "possible_triangle",
    overrides: "overrides",
  };

  writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
}
