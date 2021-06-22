import { getInput, warning } from '@actions/core';
import { Dropbox } from 'dropbox';
import { readFileSync } from 'fs';
import { basename, join } from 'path';

export default async function uploadToDropbox(input: string) {

   const accessToken = getInput('dropbox_token')
   if (!accessToken) {
      warning('Dropbox token missing, not uploading to dropbox')
      return
   }

   const path = join('/', getInput('dropbox_path'), basename(input))

   const dropbox = new Dropbox({ accessToken })

   const contents = readFileSync(input)

   await dropbox.filesUpload({
      path, contents, mode: {
         '.tag': 'overwrite'
      }
   })

}