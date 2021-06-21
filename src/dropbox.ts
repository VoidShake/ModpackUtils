import * as core from '@actions/core';
import { Dropbox } from 'dropbox';
import { readFileSync } from 'fs';
import { basename, join } from 'path';

export default async function uploadToDropbox(input: string) {

   const accessToken = core.getInput('dropbox_token')
   if (!accessToken) {
      console.warn('Dropbox token missing, not uploading to dropbox')
      return
   }

   const path = join('/', core.getInput('dropbox_path'), basename(input))

   const dropbox = new Dropbox({ accessToken })

   const contents = readFileSync(input)

   await dropbox.filesUpload({
      path, contents, mode: {
         '.tag': 'overwrite'
      }
   })

}