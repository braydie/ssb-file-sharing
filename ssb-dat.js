var FlumeReduce = require('flumeview-reduce')

exports.name = 'dat'
exports.version = require('./package.json').version
exports.manifest = {
  stream: 'source',
  get: 'async'
}

exports.init = function (ssb, config) {
  return ssb._flumeUse('dat', FlumeReduce(1, reduce, map))
}

function reduce(result, item) {
  if (!result) result = {}
  if (item) {
    var valuesForId = result[item.author] = result[item.author] || {}
    if (!valuesForId[item.name] || item.timestamp > valuesForId.timestamp) {
      valuesForId[item.name] = item.datKey
    }
  }
  return result
}

function map(msg) {
  if (msg.value.content && msg.value.content.type === 'cbenz-share-dat') {
    return {
      author: msg.value.author,
      name: msg.value.content.name,
      datKey: msg.value.content.datKey,
      timestamp: msg.value.timestamp
    }
  }
}