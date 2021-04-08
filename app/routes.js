const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })
const parseCsv = require('./parse-csv')
const UPLOADS_PATH = '/uploads'

router.post(UPLOADS_PATH, upload.single('csv'), (req, res, next) => {
  res.redirect(`/results?csv=${req.file.originalname}`)
})

router.get('/results', async (req, res, next) => {
  if (req.session.data.csv) {
    const data = fs.readFileSync(`./${UPLOADS_PATH}/${req.session.data.csv}`, 'utf8')
    const csv = await parseCsv(data)
    res.setHeader('Content-Type', 'text/csv');
    res.attachment('url-results.csv')
    res.send(csv);
  } else {
    res.redirect('/error-csv')
  }
})

module.exports = router
