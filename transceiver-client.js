const fs = require('fs')
const pull = require('pull-stream')
const tcp = require('pull-net/client');
const muxrpc = require('muxrpc')
const mdm = require('mdmanifest')

module.exports = function() {
  // HACK
  const mdmanifest = fs.readFileSync(`${__dirname}/../rfm-transceiver-service/manifest.md`, 'utf8')
  const manifest = mdm.manifest(mdmanifest)

  const transceiver = muxrpc(manifest, null) ()
  const tcp_stream = tcp(8099, '127.0.0.1')
  const rpc_stream = transceiver.createStream()

  pull(
    tcp_stream,
    rpc_stream,
    tcp_stream
  )
  
  return transceiver
}
