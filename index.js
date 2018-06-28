const rfmClient = require('./transceiver-client')
const ssbClient = require('ssb-client')
const pull = require('pull-stream')

const transceiver = rfmClient()
ssbClient( (err, sbot) => {
  if (err) throw err
  sbot.whoami( (err, feed) => {
    if (err) throw err
    console.error('ssb key', feed.id)
  })

  pull(
    transceiver.receive({from: 2}),
    pull.map( ({meta, payload}) => {
      try {
        payload = JSON.parse(Buffer.from(payload, 'hex'))
      } catch(e) {
        payload = null
      }
      if (!payload) return null
      return {meta, payload}
    }),
    pull.filter(),
    pull.drain( msg => {
      msg.type = msg.tyoe || "measurement"
      sbot.publish(msg, (err, result) => {
        if (err) return console.error(err.message)
        //console.log(JSON.stringify(result, null, 2) + "\n")
      })
    }, err => {
      if (err) throw err
    })
  )
})
