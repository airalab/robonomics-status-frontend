<template>
  <div style="height:90%;margin-bottom:-100px">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="800"
    >
      <v-card>
        <v-card-title class="headline">
          <span>{{currentNode.title}}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div>Data: <pre>{{currentNode.json}}</pre></div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-progress-linear v-if="peersCount === 0" indeterminate height="1" style="margin-top: 0;margin-bottom: 0;"></v-progress-linear>
    <v-divider v-else />
    <div id="visualization" style="background-color:#fff;height:100%"></div>
  </div>
</template>

<script>
import _has from 'lodash/has'
import _difference from 'lodash/difference'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import vis from 'vis'
import { Lighthouse } from 'robonomics-js'
import bus from '../../utils/bus'
import web3Beta from '../../utils/web3Beta'
import getIpfs, { getDataByIpns } from '../../utils/ipfs'
import getRobonomics from '../../utils/robonomics'
import config from '../../config'
import 'vis/dist/vis.css'

const robonomics = getRobonomics()
const ipfs = getIpfs()
const nodes = new vis.DataSet([])
const edges = new vis.DataSet([])
let network

let status = false
robonomics.ready().then(() => { status = true })

const recovery = (data, signature) => {
  const message = web3Beta.utils.isHexStrict(data) ? web3Beta.utils.hexToBytes(data) : data
  const messageBuffer = Buffer.from(message)
  const preamble = '\x19Ethereum Signed Message:\n' + message.length
  const preambleBuffer = Buffer.from(preamble)
  const ethMessage = Buffer.concat([preambleBuffer, messageBuffer])
  const hash = web3Beta.hash.keccak256s(ethMessage)
  return web3Beta.account.recover(hash, signature)
}

export default {
  name: 'graph',
  data () {
    return {
      peersCount: 0,
      dialog: false,
      currentNode: {},
      searchQuery: ''
    }
  },
  mounted () {
    // robonomics = getRobonomics()
    const container = document.getElementById('visualization')
    const options = {
      nodes: { borderWidth: 2 },
      interaction: { hover: true },
      groups: {
        lighthouse: {
          color: '#f15a24'
        },
        member: {
          color: '#03a5ed'
        },
        memberHide: {
          color: '#e6e6ff'
        },
        agent: {
          color: '#95d9a1'
        },
        ghost: {
          color: '#f2f2f2'
        },
        search: {
          color: '#bf24f1'
        }
      }
    }
    network = new vis.Network(container, {
      nodes: nodes,
      edges: edges
    }, options)
    network.on('click', this.click)

    const runGraph = () => {
      if (status === true) {
        ipfs.id((err, info) => {
          if (err) { throw err }
          console.log('IPFS node ready with address ' + info.id)
          this.init()
        })
      } else {
        setTimeout(runGraph, 2000)
      }
    }
    runGraph()

    bus.$on('search', (query) => {
      this.searchQuery = query
      this.search()
    })
  },
  methods: {
    resetSearch () {
      const items = nodes.get({
        filter: (item) => {
          return item.group === 'search'
        }
      })
      const newItems = _map(items, (item) => {
        return { ...item, group: item.oldgroup }
      })
      nodes.update(newItems)
    },
    search () {
      this.resetSearch()
      if (this.searchQuery === '') {
        return
      }
      const items = nodes.get({
        filter: (item) => {
          return item.title.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0
        }
      })
      if (items.length > 0) {
        const newItems = _map(items, (item) => {
          return { ...item, oldgroup: item.group, group: 'search' }
        })
        nodes.update(newItems)
        const pos = network.getPositions([items[0].id])
        network.moveTo({
          position: { x: pos[items[0].id].x, y: pos[items[0].id].y },
          animation: true
        })
      }
    },
    hide (group) {
      // const items = nodes.get({
      //   filter: (item) => {
      //     return item.group === group
      //   }
      // })
      // const newItems = _map(items, (item) => {
      //   return { ...item, hidden: true }
      // })
      // nodes.update(newItems)
    },
    init () {
      robonomics.getLighthouses()
        .then((r) => {
          r.forEach((item) => {
            this.addLighthouse(item.addr.toLowerCase(), {
              ens: item.name,
              address: item.addr
            })
          })
        })
      config.START_NODES.forEach((hash) => {
        getDataByIpns(hash, false)
          .then((data) => this.getPeers(hash, data))
      })
      ipfs.pubsub.subscribe(config.GRAPH_TOPIC, (r) => {
        const hash = r.data.toString().trim()
        getDataByIpns(hash)
          .then((data) => this.getPeers(hash, data))
      })
    },
    addLighthouse (id, info = {}) {
      const node = nodes.get(id)
      if (node) {
        nodes.update({
          ...node,
          title: (_has(info, 'ens')) ? info.ens : node.id,
          info: {
            ...node.info,
            ...info
          }
        })
        return
      }
      try {
        nodes.add({
          id,
          title: (_has(info, 'ens')) ? info.ens : id,
          group: 'lighthouse',
          info: {
            ...info
          }
        })
      } catch (err) {
        console.error(err)
      }
      this.addNodeCount()
      const li = new Lighthouse(robonomics.web3, id, ((_has(info, 'ens')) ? info.ens : ''))
      li.getMembers()
        .then((result) => {
          result.forEach((member) => {
            const address = member.toLowerCase()
            this.addMember(address)
            this.addEdges(id + address, id, address, false)
          })
        })
    },
    addMember (id, info = {}) {
      const node = nodes.get(id)
      if (node) {
        nodes.update({
          ...node,
          title: id,
          group: (_has(info, 'new')) ? 'member' : 'memberHide',
          info: {
            ...node.info,
            ...info
          }
        })
        return
      }
      try {
        nodes.add({
          id,
          title: id,
          group: (_has(info, 'new')) ? 'member' : 'memberHide',
          info: {
            ...info
          }
        })
      } catch (err) {
        console.error(err)
      }
      this.addNodeCount()
    },
    addPeer (id, info = {}) {
      const node = nodes.get(id)
      if (node) {
        nodes.update({
          ...node,
          group: (!_isEmpty(info.new)) ? 'agent' : 'ghost',
          info: {
            old: node.info.new,
            new: info.new
          }
        })
        return
      }
      try {
        nodes.add({
          id,
          title: id,
          group: (!_isEmpty(info.new)) ? 'agent' : 'ghost',
          info: {
            old: info.old,
            new: info.new
          }
        })
      } catch (err) {
        console.error(err)
      }
      this.addNodeCount()
    },
    addEdges (id, from, to, dashes = true) {
      if (edges.get(id)) {
        return
      }
      try {
        edges.add({
          id,
          from,
          to,
          arrows: (dashes === true) ? 'to' : '',
          dashes
        })
      } catch (err) {
        console.error(err)
      }
    },
    removeEdges (id) {
      try {
        edges.remove({ id })
      } catch (err) {
        console.error(err)
      }
    },
    getPeers (hash, msg) {
      let info = {}
      let data
      if (_isObject(msg)) {
        info = msg
      } else {
        data = msg.split('---')
        // if (data.length !== 2) {
        //   return
        // }
        try {
          info = JSON.parse(data[0].trim())
        } catch (err) {
          console.log(err)
          return
        }
      }
      if (_has(info, 'peers')) {
        let address = ''
        if (_has(info, 'address')) {
          address = info.address.toLowerCase()
        } else if (data.length === 2) {
          const signature = data[1].trim()
          address = recovery(data[0].trim(), signature).toLowerCase()
        } else {
          return
        }
        let old = {}
        const hashNode = nodes.get(hash)
        if (hashNode) {
          old = hashNode.info.new
          nodes.remove({ id: hash })
        }
        let group = 'addPeer'
        const addrNode = nodes.get(address)
        if (addrNode) {
          old = addrNode.info.new
          if (addrNode.group === 'member' || addrNode.group === 'memberHide') {
            group = 'addMember'
          }
        }
        this[group](address, {
          old,
          new: {
            ...info,
            address,
            date: (new Date(info.timestamp * 1000)).toString()
          }
        })
        robonomics.ens.addr(info.lighthouse)
          .then((r) => {
            const lighthouse = r.toLowerCase()
            this.addLighthouse(lighthouse, { ens: info.lighthouse, address: lighthouse })
            this.addEdges(lighthouse + address, lighthouse, address, false)
          })
        let removePeers = []
        let newPeers = info.peers
        if (_has(old, 'peers')) {
          removePeers = _difference(old.peers, info.peers)
          newPeers = _difference(info.peers, old.peers)
        }
        newPeers.forEach((element) => {
          // если ipfs hash есть то рисуем
          const hashNode = nodes.get(element)
          if (hashNode) {
            this.addEdges(address + element, address, element)
          } else {
            // если есть адрес у которого есть hash
            const items = nodes.get({
              filter: function (item) {
                return _has(item, 'info') && _has(item.info, 'new') && item.info.new.id === element
              }
            })
            if (items.length > 0) {
              const item = items[0].id
              this.addEdges(address + item, address, item)
            } else {
              // иначе добавляем hash
              this.addPeer(element, { old: {}, new: {} })
              this.addEdges(address + element, address, element)
            }
          }
          getDataByIpns(element, false)
            .then((data) => this.getPeers(element, data))
        })
        removePeers.forEach(element => {
          this.removeEdges(address + element)
        })
      }
    },
    click (params) {
      if (params.nodes.length > 0) {
        const data = nodes.get(params.nodes[0])
        this.currentNode = {
          title: data.id,
          json: ''
        }
        if (data.group === 'agent') {
          this.currentNode.json = JSON.stringify({ ...data.info.new }, null, 2)
        } else if (data.group === 'member' && _has(data.info, 'new')) {
          this.currentNode.json = JSON.stringify({ ...data.info.new }, null, 2)
        } else if (data.group !== 'ghost' && data.group === 'memberHide') {
          this.currentNode.json = JSON.stringify(data.info, null, 2)
        }
        this.dialog = true
      } else {
        this.currentNode = {}
        this.dialog = false
      }
    },
    addNodeCount () {
      this.peersCount += 1
    }
  }
}
</script>
