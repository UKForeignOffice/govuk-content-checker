const Papa = require('papaparse')
const fetch = require('node-fetch')
const AbortController = require('abort-controller');
const formatDate = require('date-fns/format')

const TIMEOUT = 10000;

Array.prototype.asyncForEach = async function(callback, thisArg) {
  thisArg = thisArg || this
  for (let i = 0, l = this.length; i !== l; ++i) {
    await callback.call(thisArg, this[i], i, this)
  }
};

module.exports = async csv => {
  const parsed = Papa.parse(csv, { skipEmptyLines: 'greedy'})
  const results = []

  await parsed.data.asyncForEach(async (row, idx) => {
    const path = row[0]
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT);
      const res = await fetch(`https://www.gov.uk/api/content/${path}`, {
        timeout: TIMEOUT,
        signal: controller.signal
      })
      clearTimeout(id)
      if (!res.ok) {
        throw new Error(`ERROR - ${path} - ${res.statusText}`)
      }
      console.info(`${idx + 1}/${parsed.data.length} - ${path} - ${res.status}`);
      results.push(await res.json())
    } catch (err) {
      console.error(err.message)
      results.push({ error: true, base_path: path, title: err.message })
    }
  })
  return Papa.unparse(
    results.map(result => {
      const { base_path, details, links, error, title, updated_at } = result;
      let countryName = '';
      if (details && details.country && details.country.name) {
        countryName = details.country.name;
      }
      if (links && links.related_mainstream_content) {
        const travelAdvice = links.related_mainstream_content.find(item => item.schema_name === 'travel_advice');
        if (travelAdvice && travelAdvice.details && travelAdvice.details.country && travelAdvice.details.country.name) {
          countryName = travelAdvice.details.country.name;
        }
      }
      return {
        path: base_path,
        country: countryName,
        title,
        updated_at: error ? '' : formatDate(new Date(updated_at), 'dd/MM/yyyy HH:mm'),
        content_api_url: `https://www.gov.uk/api/content${base_path}`
      }
    })
  )
}
