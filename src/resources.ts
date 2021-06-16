import extrator from './extractor'
import trades from './trades'

export default function extractResources() {
   extrator('resources', 'temp').catch(e => {
      console.error(e.message)
      process.exit(-1)
   })

   trades()
}
