'use strict'
var mq = require('mqemitter-redis')()
var persistence = require('aedes-persistence')()
const aedes = require('aedes')({
  id: 'BROKER_1',
  mq: redis({
    port: 6379,
    host: 'localhost',
    password: '',
    db: 12
  }),
  persistence: aedesPersistenceRedis({
    port: 6379,          // Redis port
    host: 'localhost',   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    password: '',
    db: 12,
    maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
    packetTTL: function (packet) { // offline message TTL, default is disabled
      return 10 //seconds
    }
  })
})

const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer()
const ws = require('websocket-stream')
const port = 1883
const wsPort = 8888

server.listen(port, function () {
  console.log('server listening on port', port)
})

ws.createServer({
  server: httpServer
}, aedes.handle)

httpServer.listen(wsPort, function () {
  console.log('websocket server listening on port', wsPort)
})

aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
  console.log('client error', client, err.message, err.stack)
})

aedes.on('publish', function (packet, client) {
  if (client) {
    console.log('message from client', client.id)
  }
})

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id)
  }
})

aedes.on('client', function (client) {
  console.log('New client connecting', client.id)
})

aedes.on('clientReady', function (client) {
  console.log('New client connected', client.id)
})

aedes.on('clientDisconnect', function (client) {
  console.log('New client disconnected', client.id)
})

