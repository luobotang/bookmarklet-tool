var rollup = require('rollup').rollup
var uglify = require('uglify-js')
var buble = require('buble')

module.exports = function bundle(src) {
    var ret = addIIFE(src)
    ret = buble.transform(ret).code
    ret = uglify.minify(ret).code
    return `javascript:void ${ret}`
}

function addIIFE(src) {
    return `(function() {${src}})()`
}