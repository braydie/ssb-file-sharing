var Dat = require('dat-node')
var ssbClient = require('ssb-client')

if (process.argv.length < 3) {
    console.log("usage: node share.js <dir>")
    process.exit(1)
}
var dirPath = process.argv[2]

Dat(dirPath, function (err, dat) {
    if (err) throw err
    var network = dat.joinNetwork()
    network.once('connection', function () {
        console.log('Connected')
    })
    var progress = dat.importFiles(dirPath, function (err) {
        if (err) throw err
        console.log('Done importing')
        console.log('Archive size:', dat.archive.content.byteLength)
    })
    progress.on('put', function (src, dest) {
        console.log('Added', dest.name)
    })
    var datKey = dat.key.toString('hex')
    console.log(`Sharing: ${datKey}`)
    ssbClient(function (err, sbot) {
        if (err) throw err
        sbot.publish({
            type: "cbenz-share-dat",
            name: dirPath,
            datKey,
        }, (err) => {
            if (err) throw err
            sbot.close()
        })
    })
})
