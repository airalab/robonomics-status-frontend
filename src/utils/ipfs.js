import Ipfs from 'ipfs'
import Promise from 'bluebird'
import axios from 'axios'
import _has from 'lodash/has'
import Queue from 'better-queue'
import MemoryStore from 'better-queue-memory'
import config from '../config'

const queue = new Queue((peer, cb) => {
  axios.get(`https://ipfs.io/ipns/${peer}`)
    .then((r) => cb(null, r.data))
    .catch((e) => cb(e))
}, { store: new MemoryStore(), concurrent: 10 })

const calls = {}
export const getDataByIpns = (peer, force = true) => {
  return new Promise((resolve, reject) => {
    if (_has(calls, peer) && (calls[peer] === true || force === false)) {
      resolve({})
      return
    }
    calls[peer] = true
    queue.push(peer, (err, result) => {
      setTimeout(() => {
        calls[peer] = false
      }, 5000)
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
  // return axios.get(`https://ipfs.io/ipns/${peer}`)
  //   .then((r) => r.data)
}

// ipfs.once('ready', () => ipfs.id((err, info) => {
//   if (err) { throw err }
//   console.log('IPFS node ready with address ' + info.id)
//   this.init()
// }))

let ipfs = null
const getIpfs = () => {
  if (ipfs === null) {
    ipfs = new Ipfs(config.IPFS_CONFIG)

    ipfs.on('ready', () => ipfs.id((err, info) => {
      if (err) { throw err }
      console.log('ok ' + info.id)
    }))
    window.ipfs = ipfs
  }
  return ipfs
}

export default getIpfs
