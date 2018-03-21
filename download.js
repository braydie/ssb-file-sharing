var Dat = require('dat-node')
var mirror = require('mirror-folder')
var ram = require('random-access-memory')
var ssbClient = require('ssb-client')

if (process.argv.length < 4) {
    console.log("usage: node download.js <shared_dir> <target_dir>")
    process.exit(1)
}
var sharedDir = process.argv[2]
var targetDir = process.argv[3]

ssbClient(function (err, sbot) {
    if (err) throw err
    ssbFileSharing.getFilesByPath(sbot, (filesByPath) => {
        if (!(sharedDir in filesByPath)) {
            console.log("Not found")
            process.exit(1)
        }
        var msg = filesByPath[sharedDir]
        var datKey = ssbFileSharing.getDatKey(msg)
        Dat(ram, { key: datKey, sparse: true }, function (err, dat) {
            if (err) throw err
            var network = dat.joinNetwork(function (err) {
                if (err) throw err
                // After the first round of network checks, the callback is called
                // If no one is online, you can exit and let the user know.
                if (!dat.network.connected || !dat.network.connecting) {
                    console.error('No users currently online for that key.')
                    process.exit(1)
                }
            })
            network.once('connection', function () {
                console.log('Connected')
            })
            dat.archive.metadata.update(function () {
                var progress = mirror({ fs: dat.archive, name: '/' }, targetDir, function (err) {
                    if (err) throw err
                    console.log('Done')
                    dat.close()
                    sbot.close()
                })
                progress.on('put', function (src) {
                    console.log('Downloading', src.name)
                })
            })
            console.log(`Downloading: ${dat.key.toString('hex')}`)
        })

        // Dat(targetDir, { key: datKey }, function (err, dat) {
        //     if (err) throw err
        //     dat.joinNetwork(function (err) {
        //         if (err) throw err
        //         // After the first round of network checks, the callback is called
        //         // If no one is online, you can exit and let the user know.
        //         if (!dat.network.connected || !dat.network.connecting) {
        //             console.error('No users currently online for that key.')
        //             process.exit(1)
        //         }
        //         dat.close((_) => {
        //             console.log("Download complete, exit")
        //             sbot.close()
        //         })
        //     })
        // })
    })
})
