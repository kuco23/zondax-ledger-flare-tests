import { ethers } from 'ethers'
import Transport from '@ledgerhq/hw-transport-node-hid'
import FlareApp from '@zondax/ledger-flare'
import { FLR_RPC, CCHAIN_PATH, ERC20_ABI, RECEIVER_ADDRESS, WRAPPED_FLARE_ADDRESS } from './constants'
import { prefix0x, unPrefix0x, sleep } from './utils'


const provider = new ethers.JsonRpcProvider(FLR_RPC)

async function signAndSendCChainTx(rawTx: any) {
  const transport = await Transport.create()
  const flare = new FlareApp(transport)
  // get address and balance (if balance is zero, throw error)
  const addressAndPubKey = await flare.getEVMAddress(CCHAIN_PATH, false)
  const publicKey = addressAndPubKey.publicKey
  const address = ethers.computeAddress(prefix0x(publicKey))
  const balance = await provider.getBalance(address)
  if (balance / BigInt(1e12) == BigInt(0))
    throw new Error(`no balance on address ${address}`)
  console.log("balance:", ethers.formatEther(balance))
  // set nonce and chainId
  const nonce = await provider.getTransactionCount(address)
  rawTx.nonce = nonce
  rawTx.chainId = 14
  // construct and sign ethers tx
  const tx = ethers.Transaction.from(rawTx)
  const signature = await flare.signEVMTransaction(CCHAIN_PATH, unPrefix0x(tx.unsignedSerialized), null)
  signature.r = prefix0x(signature.r)
  signature.s = prefix0x(signature.s)
  signature.v = prefix0x(signature.v)
  tx.signature = ethers.Signature.from(signature)
  // send and wait for tx finalization
  console.log("sending tx:", tx.hash)
  await provider.send('eth_sendRawTransaction', [tx.serialized])
  console.log("waiting for tx finalization")
  while (true) {
    await sleep(2000)
    const _nonce = await provider.getTransactionCount(address)
    if (_nonce > nonce) {
      console.log("tx finalized", tx.hash)
      break
    }
  }
}

async function contractCallTx(abi: any, address: string, method: string, params: any[], value: string | number): Promise<any> {
  const contract = new ethers.Contract(address, abi, provider)
  const callTx = await contract.getFunction(method).populateTransaction(...params, { type: 0 })
  return {
    ...callTx,
    gasPrice: 50000000000,
    gasLimit: 8000000,
    chainId: 14,
    value: value
  }
}

describe('Zondax evm methods', () => {

  it("should sign and send a simple evm transfer", async () => {
    const evmTransferTx = {
      gasPrice: 25000000000,
      gasLimit: 21000,
      to: RECEIVER_ADDRESS,
      value: 1,
      data: '0x'
    }
    await signAndSendCChainTx(evmTransferTx)
  })

  it("should sign and send an erc20 deposit transaction", async () => {
    const wNatDepositTx = await contractCallTx(ERC20_ABI, WRAPPED_FLARE_ADDRESS, 'deposit', [], 1)
    await signAndSendCChainTx(wNatDepositTx)
  })

  it("should sign and send an erc20 transfer transaction", async () => {
    const erc20TransferTx = await contractCallTx(ERC20_ABI, WRAPPED_FLARE_ADDRESS, 'transfer', [RECEIVER_ADDRESS, 1], 0)
    console.log(erc20TransferTx.data)
    await signAndSendCChainTx(erc20TransferTx)
  })
})
