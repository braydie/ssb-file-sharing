var cont = require('cont')
var Dat = require('dat-node')
const mapObj = require('map-obj')
var ssbClient = require('ssb-client')
var pull = require('pull-stream')


function seedDat(path, cb) {
    console.log('Seeding %s', path)
    Dat(path, function (err, dat) {
        if (err) cb(err, null)
        var network = dat.joinNetwork()
        network.once('connection', function () {
            console.log('%s: Connected', path)
        })
        var progress = dat.importFiles(path, function (err) {
            if (err) cb(err, null)
            console.log('%s: Done importing', path)
            console.log('%s: Archive size: %d', path, dat.archive.content.byteLength)
        })
        progress.on('put', function (src, dest) {
            console.log('%s: Added %s', path, dest.name)
        })
        cb(null, dat)
    })
}

ssbClient(function (err, sbot) {
    if (err) throw err
    sbot.whoami(function (err, info) {
        if (err) throw err
        var userId = info.id
        pull(
            sbot.dat.stream(),
            pull.map((datKeys) => datKeys[userId]),
            pull.drain(function (datKeyByPath) {
                var seedByPath = mapObj(datKeyByPath, (path, _) => [path, cont(seedDat)(path)])
                cont.para(seedByPath)(function (err, datByPath) {
                    if (err) throw err
                    for (path in datByPath) {
                        var dat = datByPath[path]
                        var datKey = dat.key.toString('hex')
                        var knownDatKey = datKeyByPath[path]
                        if (datKey !== knownDatKey) {
                            throw "Keys differ: known = " + knownDatKey + ", computed = " + datKey
                        }
                    }
                    console.log(datKeyByPath)
                    sbot.close()
                })
            }),
        )
    })
})
