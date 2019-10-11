import getAllResponseHeaders from './getAllResponseHeaders'

export default async function getHeader (name) {
  return new Promise(async (resolve) => {
    if (!name) {
      resolve('')
    } else {
      let allResponseHeaders = await getAllResponseHeaders()
      try {
        let headers = allResponseHeaders.toString().replace(/[\r\n]/g, '$$').replace(/\s+/g, '').split('$$' + name.toLowerCase() + ':')[1].replace(/^(\d*)(\$?\$?.*)$/, '$1')
        resolve(headers)
      } catch (err) {
        resolve('')
      }
    }
  })
}