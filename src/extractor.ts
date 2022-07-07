import { endGroup, info, startGroup } from "@actions/core";
import cpy from "cpy";
import unzip from "extract-zip";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { basename, extname, join, resolve } from "path";
import rimraf from "rimraf";

export default async function extract(
  from: string,
  to: string,
  predicate?: (s: string) => boolean
) {
  startGroup(`Extracting ${from} -> ${to}`);

  const out = resolve(to);
  const packs = readdirSync(from)
    .filter((p) => !predicate || predicate(p))
    .map((f) => join(from, f));

  const archives = ["zip", "jar"].map((e) => `.${e}`);
  const zips = packs.filter(
    (f) => statSync(f).isFile() && archives.includes(extname(f))
  );
  const dirs = packs.filter((f) => statSync(f).isDirectory());

  await new Promise<void>((res, rej) =>
    rimraf(out, (e) => {
      if (e) rej(e);
      else res();
    })
  );

  mkdirSync(out, { recursive: true });

  for (const pack of dirs) {
    await Promise.all(
      ["assets", "data"].map((dir) => {
        if (existsSync(join(pack, dir)))
          return cpy(dir, out, { parents: true, cwd: pack });
      })
    );

    info(`Copied ${basename(pack)}`);
  }

  for (const pack of zips) {
    await unzip(pack, { dir: out });
    info(`Unzipped ${basename(pack)}`);
  }

  endGroup();
}
