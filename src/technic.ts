import { endGroup, getInput, startGroup, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import archiver from "archiver";
import { createWriteStream, readFileSync } from "fs";
import uploadToDropbox from "./dropbox";
import { getRelease } from "./inputs";
import { RawRelease } from "./releases";
import replaceContent from "./replacer";
import extractResources from "./resources";
import removeClientContent from "./server";

export default async function technicRelease() {
  startGroup("Creating zip releases for TechnicPack");

  await replaceContent();
  await extractResources();

  await zipAndUpload("client");

  removeClientContent();
  await zipAndUpload("server");

  endGroup();
}

async function zipAndUpload(name: string) {
  const paths = ["config", "mods", "kubejs", "defaultconfigs", "bin"];
  const archive = archiver("zip");
  const file = name + ".zip";

  archive.pipe(createWriteStream(file));
  paths.forEach((dir) => archive.directory(dir, dir));
  await archive.finalize();

  await uploadToDropbox(file);

  const release = getRelease();
  if (release) await uploadToRelease(file, release);
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
    name: `technic-${file}`,
    data: readFileSync(file) as any,
    headers: {
      "Content-Type": "application/zip",
    },
  });
}
