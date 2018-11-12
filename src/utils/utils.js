export const formatDecimals = (price, decimals) => {
  const priceNum = new web3.BigNumber(price)
  return priceNum.shift(-decimals).toString(10)
}

export const watchTx = (tx) => {
  const transactionReceiptAsync = (resolve, reject) => {
    web3.eth.getTransactionReceipt(tx, (error, receipt) => {
      if (error) {
        reject(error)
      } else if (receipt === null) {
        setTimeout(() => transactionReceiptAsync(resolve, reject), 5000)
      } else {
        resolve(receipt)
      }
    })
  }
  if (Array.isArray(tx)) {
    return Promise.all(tx.map(oneTx => watchTx(oneTx)))
  } else if (typeof tx === 'string') {
    return new Promise(transactionReceiptAsync)
  }
  throw new Error(`Invalid Type: ${tx}`)
}

export const intFormat = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const floatFormat = (x) => {
  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join('.')
}
