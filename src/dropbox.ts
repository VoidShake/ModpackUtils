import { Dropbox } from 'dropbox';
import { readFile } from 'fs';
import { basename } from 'path';

export default async function uploadToDropbox(input: string) {

   const { ACCESS_TOKEN } = process.env
   const dropbox = new Dropbox({ accessToken: ACCESS_TOKEN })

   readFile(input, async (error, contents) => {
      try {

         if (error) throw error

         const response = await dropbox.filesUpload({
            path: `/${basename(input)}`, contents, mode: {
               '.tag': 'overwrite'
            }
         })
         console.log(response)
         process.exit(0)

      } catch (e) {
         console.error(e)
         process.exit(-1)
      }
   })

}