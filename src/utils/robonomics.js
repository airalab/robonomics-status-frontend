import Robonomics, { MessageProviderIpfs } from 'robonomics-js'
import getIpfs from './ipfs'
import config from '../config'

let robonomics = null
const getRobonomics = () => {
  if (robonomics === null) {
    let web3Instance
    if (typeof web3 !== 'undefined') {
      web3Instance = web3
    } else {
      web3Instance = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/dB7cHVwoLkYsFbkF4c3f'))
    }
    // web3Instance.eth.getBlockNumber((e, r) => { console.log(e, r) })
    robonomics = new Robonomics({
      web3: web3Instance,
      provider: new MessageProviderIpfs(getIpfs()),
      ens: config.ENS,
      version: config.VERSION,
      account: '0x0000000000000000000000000000000000000000'
    })
    window.robonomics = robonomics
  }
  return robonomics
}

export default getRobonomics
