const Papa = require('papaparse')
const fetch = require('node-fetch')
const formatDate = require('date-fns/format')

module.exports = async csv => {
  const parsed = Papa.parse(csv)

  const results = await Promise.allSettled(parsed.data
    .map(async ([path]) => {
      try {
        const res = await fetch(`https://www.gov.uk/api/content/${path}`)
        if (!res.ok) {
          throw new Error('error')
        }
        return res.json()
      } catch (err) {
        console.error(err)
        return Promise.resolve({ error: true, base_path: path })
      }
    })
  )
  return Papa.unparse(
    results.map(result => ({
      path: result.value.base_path,
      title: result.value.error ? 'ERROR' : result.value.title,
      updated_at: result.value.error ? '' : formatDate(new Date(result.value.updated_at), 'dd/MM/yyyy HH:mm'),
      content_api_url: `https://www.gov.uk/api/content${result.value.base_path}`
    }))
  )
}
