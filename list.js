var Dat = require('dat-node')
var ram = require('random-access-memory')
var ssbClient = require('ssb-client')


ssbClient(function (err, sbot) {
    if (err) throw err
    sbot.dat.get((err, archives) => {
        if (err) throw err
        for (var author in archives) {
            console.log("Files of %s", author)
            var datKeyByDir = archives[author]
            for (var sharedDir in datKeyByDir) {
                console.log("Files in %s", sharedDir)
                var datKey = datKeyByDir[sharedDir]
                Dat(ram, { key: datKey, sparse: true }, function (err, dat) {
                    if (err) throw err
                    var network = dat.joinNetwork(function (err) {
                        if (err) throw err
                        // After the first round of network checks, the callback is called
                        // If no one is online, you can exit and let the user know.
                        if (!dat.network.connected || !dat.network.connecting) {
                            console.error('No users currently online for that key.')
                            dat.close()
                            sbot.close()
                            // process.exit(1)
                        }
                    })
                    network.once('connection', function () {
                        console.log('Connected')
                    })
                    dat.archive.metadata.update(function () {
                        dat.archive.readdir('/', function (err, list) {
                            if (err) throw err
                            console.log(list)
                            dat.close()
                            sbot.close()
                        })
                    })
                })
            }
        }
    })
})
