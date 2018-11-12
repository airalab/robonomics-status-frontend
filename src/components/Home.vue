<template>
  <v-container grid-list-md class="text-lg-center">
    <v-layout row wrap>
      <v-flex md12 class="mb-5">
        <h1 class="mb-3">Statistics of Robonomics network activity</h1>
        <div class="title"><v-icon>move_to_inbox</v-icon> LAST BLOCK: <strong>{{lastBlock}}</strong></div>
      </v-flex>
      <v-flex md12 class="mb-5">
        <h2 class="mb-3">Amount of recycling gas in a block of Ethereum network</h2>

        <strong>Full amount of utilized gas</strong>
        <v-layout row wrap class="mt-3">
          <v-flex md3>
            last block<br />
            <strong>{{gas.full.b}}</strong>
          </v-flex>
          <v-flex md3>
            last 24 hours<br />
            <strong>{{gas.full.d}}</strong>
          </v-flex>
          <v-flex md3>
            last week<br />
            <strong>{{gas.full.w}}</strong>
          </v-flex>
          <v-flex md3>
            last month<br />
            <strong>{{gas.full.m}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />

        <strong>Profit amount of utilized gas</strong>
        <v-layout row wrap class="mt-3">
          <v-flex md3>
            last block<br />
            <strong>{{gas.fin.b}}</strong>
          </v-flex>
          <v-flex md3>
            last 24 hours<br />
            <strong>{{gas.fin.d}}</strong>
          </v-flex>
          <v-flex md3>
            last week<br />
            <strong>{{gas.fin.w}}</strong>
          </v-flex>
          <v-flex md3>
            last month<br />
            <strong>{{gas.fin.m}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />
      </v-flex>
      <v-flex md12 class="mb-5">
        <h2 class="mb-3">Capacity of Robonomics network</h2>

        <strong>Amount of created contract liabilities</strong>
        <v-layout row wrap class="mt-3">
          <v-flex md3>
            last block<br />
            <strong>{{li.create.b}}</strong>
          </v-flex>
          <v-flex md3>
            last 24 hours<br />
            <strong>{{li.create.d}}</strong>
          </v-flex>
          <v-flex md3>
            last week<br />
            <strong>{{li.create.w}}</strong>
          </v-flex>
          <v-flex md3>
            last month<br />
            <strong>{{li.create.m}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />

        <strong>Amount of finalized contract liabilities</strong>
        <v-layout row wrap class="mt-3">
          <v-flex md3>
            last block<br />
            <strong>{{li.fin.b}}</strong>
          </v-flex>
          <v-flex md3>
            last 24 hours<br />
            <strong>{{li.fin.d}}</strong>
          </v-flex>
          <v-flex md3>
            last week<br />
            <strong>{{li.fin.w}}</strong>
          </v-flex>
          <v-flex md3>
            last month<br />
            <strong>{{li.fin.m}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />

        <strong>Error transaction</strong>
        <v-layout row wrap class="mt-3">
          <v-flex md3>
            last block<br />
            <strong>{{err.b}}</strong>
          </v-flex>
          <v-flex md3>
            last 24 hours<br />
            <strong>{{err.d}}</strong>
          </v-flex>
          <v-flex md3>
            last week<br />
            <strong>{{err.w}}</strong>
          </v-flex>
          <v-flex md3>
            last month<br />
            <strong>{{err.m}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />
      </v-flex>
      <v-flex md12 class="mb-5">
        <h2 class="mb-3">XRT</h2>
        <strong>
          <a :href="`https://etherscan.io/address/${xrt.name}`" class="btn__text_orange" target="_blank">
            {{xrt.name}}
          </a>
        </strong><br/>
        <small>{{xrt.address}}</small>
        <v-layout row wrap class="mt-3">
          <v-flex md6>
            XTR token emission for the whole period<br />
            <strong>{{totalSupply}}</strong>
          </v-flex>
          <v-flex md6>
            Reward in Wn per unit of gas<br />
            <strong>{{wn}}</strong>
          </v-flex>
        </v-layout>
        <v-divider class="mb-5" />
      </v-flex>
      <v-flex md12>
        <h2 class="mb-3">Factory liability</h2>
        <strong>
          <a :href="`https://etherscan.io/address/${factory.name}`" class="btn__text_orange" target="_blank">
            {{factory.name}}
          </a>
        </strong><br/>
        <small>{{factory.address}}</small>
        <div class="mt-3 text-lg-left">
          <v-card v-for="(item, i) in contracts" :key="i" class="mb-2">
            <v-card-text>
              <p>
                Contract: <a class="liability" :href="`https://etherscan.io/address/${item.address}`" target="_blank">
                  {{item.address}}
                </a>
              </p>
              <p>
                Tx: <a :href="`https://etherscan.io/tx/${item.txCreate}`" target="_blank">
                  {{item.txCreate}}
                </a>
              </p>
              <p>
                Block: <a :href="`https://etherscan.io/block/${item.blockCreate}`" target="_blank">
                  {{item.blockCreate}}
                </a>
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from 'axios'
import _has from 'lodash/has'
import { floatFormat, intFormat } from '../utils/utils'
import config from '../config'

export default {
  name: 'home',
  data () {
    return {
      factory: config.FACTORY,
      xrt: config.XRT,
      lastBlock: 0,
      totalSupply: 0,
      wn: 0,
      contracts: 0,
      gas: {
        full: {
          b: 0,
          d: 0,
          w: 0,
          m: 0
        },
        fin: {
          b: 0,
          d: 0,
          w: 0,
          m: 0
        }
      },
      li: {
        create: {
          b: 0,
          d: 0,
          w: 0,
          m: 0
        },
        fin: {
          b: 0,
          d: 0,
          w: 0,
          m: 0
        }
      },
      err: {
        b: 0,
        d: 0,
        w: 0,
        m: 0
      }
    }
  },
  created () {
    axios.get(config.URL_DATA + '/start')
      .then((r) => {
        this.lastBlock = r.data.result.lastBlock
        this.totalSupply = floatFormat(r.data.result.totalSupply)
        this.wn = r.data.result.wn
        this.contracts = r.data.result.liability

        Object.keys(r.data.result.gas.full).forEach((key) => {
          this.gas.full[key] = intFormat(Math.round(r.data.result.gas.full[key]))
          this.gas.fin[key] = intFormat(Math.round(r.data.result.gas.fin[key]))
          this.li.create[key] = intFormat(Math.round(r.data.result.li.create[key]))
          this.li.fin[key] = intFormat(Math.round(r.data.result.li.fin[key]))
          this.err[key] = intFormat(Math.round(r.data.result.err[key]))
        })
      })

    const socket = io(config.URL_DATA)
    socket.on('lastBlock', (r) => {
      this.lastBlock = r
    })
    socket.on('totalSupply', (r) => {
      this.totalSupply = floatFormat(r)
    })
    socket.on('wn', (r) => {
      this.wn = r
    })
    socket.on('gas', (r) => {
      // console.log('full', r)
      if (_has(r, 'full')) {
        Object.keys(r.full).forEach((key) => {
          this.gas.full[key] = intFormat(Math.round(r.full[key]))
          this.gas.fin[key] = intFormat(Math.round(r.fin[key]))
        })
      }
    })
    socket.on('li', (r) => {
      // console.log('create', r)
      if (_has(r, 'create')) {
        Object.keys(r.create).forEach((key) => {
          this.li.create[key] = intFormat(Math.round(r.create[key]))
          this.li.fin[key] = intFormat(Math.round(r.fin[key]))
        })
      }
    })
    socket.on('err', (r) => {
      // console.log('err', r)
      if (_has(r, 'err')) {
        Object.keys(r.err).forEach((key) => {
          this.err[key] = intFormat(Math.round(r.err[key]))
        })
      }
    })
    socket.on('liability', (r) => {
      this.contracts = r
    })
  }
}
</script>
