<template>
  <v-container grid-list-md class="text-lg-center">
    <v-layout row wrap>
      <v-flex md12>
        <h1>Live log messages from {{lighthouse}}</h1>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex md6>
        <h3>DEMAND (last 50 / {{askCount}})</h3>
      </v-flex>
      <v-flex md6>
        <h3>OFFER (last 50 / {{bidCount}})</h3>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="text-lg-left" style="height: 500px;overflow-y: scroll;overflow-x: hidden;border:1px solid #eee">
      <v-flex md6>
        <div v-for="(item, i) in asks" :key="i">
          <b>promisee: </b>{{ item.account }} |<br />
          <b>model: </b>{{ item.model }} |<br />
          <b>objective: </b>{{ item.objective }} |<br />
          <b>token: </b>{{ item.token }} |<br />
          <b>cost: </b>{{ item.cost }} |<br />
          <b>lighthouse: </b>{{ item.lighthouse }} |<br />
          <b>validator: </b>{{ item.validator }} |<br />
          <b>validatorFee: </b>{{ item.validatorFee }} |<br />
          <b>deadline: </b>{{ item.deadline }}
          <v-divider class="mb-4" />
        </div>
      </v-flex>
      <v-flex md6>
        <div v-for="(item, i) in bids" :key="i">
          <b>promisor: </b>{{ item.account }} |<br />
          <b>model: </b>{{ item.model }} |<br />
          <b>objective: </b>{{ item.objective }} |<br />
          <b>token: </b>{{ item.token }} |<br />
          <b>cost: </b>{{ item.cost }} |<br />
          <b>validator: </b>{{ item.validator }} |<br />
          <b>lighthouse: </b>{{ item.lighthouse }} |<br />
          <b>lighthouseFee: </b>{{ item.lighthouseFee }} |<br />
          <b>deadline: </b>{{ item.deadline }}
          <v-divider class="mb-4" />
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { Channel } from 'robonomics-js'
import Provider from '../utils/provider'
import config from '../config'

export default {
  name: 'msg',
  data () {
    return {
      lighthouse: config.LIGHTHOUSE.name,
      askCount: 0,
      bidCount: 0,
      asks: [],
      bids: []
    }
  },
  created () {
    const socket = io(config.IPFS_PUBSUB)
    const provider = new Provider(socket)
    const channel = new Channel(config.LIGHTHOUSE.name, provider)
    channel.demands((msg) => {
      this.asks = [{ ...msg }, ...this.asks]
      this.asks = this.asks.slice(0, 50)
      this.askCount++
    })
    channel.offers((msg) => {
      this.bids = [{ ...msg }, ...this.bids]
      this.bids = this.bids.slice(0, 50)
      this.bidCount++
    })
  }
}
</script>
