import { getInput } from "@actions/core";
import * as github from "@actions/github";
import { readFileSync } from "fs";
import { RawRelease } from "./releases";
import { MinecraftInstance } from "./web";

export function getPackVersion(): string | null {
  if (github.context.eventName === "release") {
    const release: RawRelease = github.context.payload.release;
    return release.tag_name;
  } else {
    return getInput("pack_version");
  }
}

export function getPackName() {
  const customName = getInput("pack_name");
  if (customName) return customName;

  const instance = JSON.parse(
    readFileSync("minecraftinstance.json").toString()
  ) as MinecraftInstance;

  return instance.name;
}
