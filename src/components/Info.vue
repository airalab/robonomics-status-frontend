<template>
  <div>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex md12>
          <v-card>
            <v-card-title primary-title>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md10>
                    <h3 class="headline mb-0">Drone registration</h3>
                  </v-flex>
                  <v-flex md2 class="text-xs-right">
                    <v-btn to="check" color="warning">
                      Check
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md12>
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-text-field
                        v-model="email"
                        :rules="emailRules"
                        label="E-mail"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="idDrone"
                        :rules="idDroneRules"
                        label="ID drone"
                        required
                      ></v-text-field>
                      <v-checkbox
                        v-model="checkbox"
                        :rules="[v => !!v || 'You must agree to continue!']"
                        required
                      >
                        <div slot="label">
                          You agree to our
                          <a href="static/ToS_-_Decentralized_Technology_(draft).doc" target="_blank">Terms of service</a>
                          and
                          <a href="static/Privacy_Policy_Decentralized_Technology_v.3_(draft).docx" target="_blank">Privacy Policy</a>
                        </div>
                      </v-checkbox>
                    </v-form>
                  </v-flex>
                </v-layout>
              </v-container>
              <v-divider />
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md12>
                    <div>
                      Cost: {{price.valueStr}} |
                      Balance: {{balance.valueStr}} |
                      Approved: {{approveTrade.valueStr}}
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>

              <v-btn
                v-if="approveTrade.value < price.value"
                :loading="loadingApprove"
                :disabled="loadingApprove || balance.value < price.value"
                color="warning"
                @click.native="sendApproveTrade"
              >
                Approve
              </v-btn>
              <v-btn
                v-if="approveTrade.value >= price.value"
                :loading="loadingOrder"
                :disabled="loadingOrder || balance.value < price.value || !valid"
                color="warning"
                @click.native="order"
              >
                Order
              </v-btn>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex md12>
          <v-card v-if="liability">
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Result</h3>
              </div>
            </v-card-title>
            <v-card-text>
              <Liability :liability="liability" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios'
import { Token } from 'robonomics-js'
import getRobonomics from '../utils/robonomics'
import { formatDecimals, watchTx } from '../utils/utils'
import ipfsBagCat from '../utils/ipfs'
import Liability from './Liability'
import config from '../config'

let robonomics

export default {
  name: 'info',
  components: {
    Liability
  },
  data () {
    return {
      token: null,
      price: {
        value: config.PRICE,
        valueStr: `${config.PRICE} ${config.TOKEN_SYMBOL}`
      },
      loadingApprove: false,
      loadingOrder: false,
      balance: {
        value: 0,
        valueStr: `0 ${config.TOKEN_SYMBOL}`
      },
      approveTrade: {
        value: 0,
        valueStr: `0 ${config.TOKEN_SYMBOL}`,
        show: true,
        disabled: true,
        text: 'Approve'
      },
      market: config.MARKET_MODEL,
      lighthouseName: config.LIGHTHOUSE.name,
      liability: null,

      valid: false,
      email: '',
      idDrone: '',
      checkbox: false,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      idDroneRules: [
        v => !!v || 'Id drone is required'
      ]
    }
  },
  created () {
    robonomics = getRobonomics()
    robonomics.ready().then(() => {
      this.token = new Token(robonomics.web3, config.TOKEN)
      robonomics.setLighthouse(this.lighthouseName)
        .then(() => this.fetchData())
        .then(() => {
          console.log('xrt', robonomics.xrt.address)
          console.log('factory', robonomics.factory.address)
          console.log('lighthouse', robonomics.lighthouse.address)
          robonomics.getAsk(this.market, (msg) => {
            console.log('ask', msg)
            // emulator kfc
            // return this.emulatorKfc(msg)
          })
          robonomics.getBid(this.market, (msg) => {
            console.log('bid', msg)
          })
          robonomics.getResult((msg) => {
            console.log('result unverified', msg)
            if (this.liability !== null && msg.liability === this.liability.address) {
              this.setResult(msg.result, false)
            }
          })
        })
    })
  },
  methods: {
    emulatorKfc (ask) {
      const bid = {
        objective: ask.objective,
        token: ask.token,
        cost: ask.cost,
        lighthouseFee: 0,
        deadline: ask.deadline
      }
      return robonomics.postBid(this.market, bid)
        .then((liability) => {
          console.log('liability bid', liability.address)
          return robonomics.postResult({ liability: liability.address, result: 'QmQU8UuWAHQev3BYSYirk6shgZrBGEq87DTyxDVYvsywtt' })
        })
        .then(() => {
          console.log('result send msg')
        })
    },
    fetchData () {
      return this.token.call('balanceOf', [web3.eth.accounts[0]])
        .then((balanceOf) => {
          this.balance.value = balanceOf
          this.balance.valueStr = `${formatDecimals(balanceOf, 0)} ${config.TOKEN_SYMBOL}`
          if (balanceOf > 0) {
            return this.token.call('allowance', [web3.eth.accounts[0], robonomics.factory.address])
          }
          return false
        })
        .then((allowance) => {
          if (allowance) {
            this.approveTrade.value = allowance
            this.approveTrade.valueStr = `${formatDecimals(allowance, 0)} ${config.TOKEN_SYMBOL}`
            if (allowance <= 0) {
              this.approveTrade.disabled = false
              this.approveTrade.text = 'Approve'
            } else {
              this.approveTrade.disabled = true
              this.approveTrade.text = 'Approved'
            }
          }
        })
    },
    sendApproveTrade () {
      this.loadingApprove = true
      return this.token.send('approve', [robonomics.factory.address, this.price.value * 100], { from: web3.eth.accounts[0] })
        .then((r) => {
          this.approveTrade.disabled = true
          this.approveTrade.text = '...'
          return watchTx(r)
        })
        .then(() => {
          this.loadingApprove = false
          this.approveTrade.text = 'Approved'
          return this.fetchData()
        })
        .catch(() => {
          this.loadingApprove = false
        })
    },
    getObjective () {
      // return Promise.resolve('QmQU8UuWAHQev3BYSYirk6shgZrBGEq87DTyxDVYvsywtt')
      const payload = {
        email: this.email,
        droneid: this.idDrone
      }
      return axios.post(config.URL_GET_OBJECTIVE, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((r) => {
          if (r.data.objective) {
            return r.data.objective
          }
          return false
        })
    },
    setResult (result, check = true) {
      this.liability = {
        ...this.liability,
        result,
        check
      }
      if (this.liability.resultMessage.length === 0) {
        this.liability.resultMessage.push('')
        ipfsBagCat(result, {}, (bag) => {
          this.liability.resultMessage.push(bag.data)
        })
      }
    },
    newLiability (liability) {
      console.log('liability ask', liability.address)
      return liability.getInfo()
        .then((info) => {
          this.liability = {
            address: liability.address,
            lighthouse: liability.lighthouse,
            worker: liability.worker,
            ...info,
            resultMessage: []
          }
          liability.watchResult((result) => {
            console.log('result', result)
            this.setResult(result, true)
          })
          return true
        })
        .catch((e) => {
          console.log(e)
          setTimeout(() => {
            this.newLiability(liability)
          }, 2000)
        })
    },
    order () {
      if (this.$refs.form.validate() && this.price.value > 0) {
        this.liability = null
        this.loadingOrder = true
        return this.getObjective()
          .then((objective) => {
            web3.eth.getBlock('latest', (e, r) => {
              const ask = {
                objective,
                token: this.token.address,
                cost: this.price.value,
                validator: '0x0000000000000000000000000000000000000000',
                validatorFee: 0,
                deadline: r.number + 1000
              }
              robonomics.postAsk(this.market, ask)
                .then((liability) => this.newLiability(liability))
                .then(() => {
                  this.loadingOrder = false
                })
                .catch((e) => {
                  this.loadingOrder = false
                })
            })
          })
          .catch((e) => {
            this.loadingOrder = false
          })
      }
      return false
    }
  }
}
</script>
