import Transport from '@ledgerhq/hw-transport-node-hid'
import FlareApp from '@zondax/ledger-flare'
import { PCHAIN_PATH } from './constants'
import { BN } from 'bn.js'

const fstTransaction = require('@flarenetwork/flare-stake-tool/dist/src/transaction/evmAtomicTx')
const fstContext = require('@flarenetwork/flare-stake-tool/dist/src/context')


describe("Zondax P-chain signing", () => {
  let flareApp: FlareApp
  let context: any

  before(async () => {
    const transport = await Transport.create()
    flareApp = new FlareApp(transport)
    const resp = await flareApp.getAddressAndPubKey(PCHAIN_PATH)
    context = fstContext.getContext('flare', resp.compressed_pk!.toString('hex'))
    console.log(context.cAddressHex)
  })

  it.only("should sign and issue an exportCP transaction to the network", async () => {    
    
    const params = {
      amount: new BN(1)
    }

    const unsignedTx = await fstTransaction.getUnsignedExportTxCP(context, params.amount)
    const unsignedTxBuffer = Buffer.from(unsignedTx.unsignedTransactionBuffer, 'hex')
    const resp = await flareApp.sign(PCHAIN_PATH, unsignedTxBuffer)
    const signature = Buffer.concat([resp.r!, resp.s!, resp.v!]).toString('hex')
    const signedTx = { ...unsignedTx, signature }
    await fstTransaction.issueSignedEvmTxCPExport(context, signedTx)
  })
})
