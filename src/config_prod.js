export const VERSION = 3
export const URL_DATA = 'https://devjs-01.corp.aira.life:3004'
export const IPFS_PUBSUB = 'https://wss.pool.aira.life'
export const LIGHTHOUSE = {
  name: 'airalab.lighthouse.3.robonomics.eth',
  address: '0xD06Eda15582ce766000f0e88Ef94E34217bf8fB7'
}
export const FACTORY = {
  name: 'factory.3.robonomics.eth',
  address: '0xBd127854f5F9022B72459ca97EcE166df9B3012D'
}
export const XRT = {
  name: 'xrt.3.robonomics.eth',
  address: '0x98DFc5247da729c045D4938bABD081A61a455776'
}
// export const START_NODES = ['QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8']
export const START_NODES = []
export const GRAPH_TOPIC = 'graph.3.robonomics.eth'
export const ENS = ''
export const IPFS_CONFIG = {
  repo: 'ipfs/pubsub-graph',
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    },
    Bootstrap: [
      '/dns4/wss.ipfs.pool.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8'
    ]
  }
}
