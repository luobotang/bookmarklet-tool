var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var bundle = require('./bundle')

var app = express()
app.use(express.static(path.join(__dirname, '..')))
app.post('/transform', bodyParser.text())
app.post('/transform', function (req, res, next) {
    if (req.body) {
        res.send(bundle(req.body))
    } else {
        res.status(500)
        res.send('no body data')
        console.error('no body data')
    }
})
app.listen(8888, () => {
    console.log('on 8888...')
})