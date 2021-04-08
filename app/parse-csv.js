const Papa = require('papaparse')
const fetch = require('node-fetch')

module.exports = async csv => {
  const parsed = Papa.parse(csv)

  const results = await Promise.allSettled(parsed.data
    .map(async path => {
      try {
        const res = await fetch(`https://www.gov.uk/api/content/${path}`)
        return res.json()
      } catch (err) {
        console.error(err)
        return { path, error: err.message }
      }
    })
  )
  return Papa.unparse(
    results.map(result => (result.value ? {
      path: result.value.base_path,
      title: result.value.title,
      updated_at: result.value.updated_at
    } : {
      path: result.path,
      error: result.error
    }))
  )
}