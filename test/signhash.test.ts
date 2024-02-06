import { assert } from 'chai'
import { ethers } from 'ethers'
import { ec } from 'elliptic'
import Transport from '@ledgerhq/hw-transport-node-hid'
import FlareApp from '@zondax/ledger-flare'
import { CCHAIN_PATH } from './constants'
import { unPrefix0x, prefix0x } from './utils'

const secpk256k1 = new ec('secp256k1')

describe("Zondax sign hash", () => {
    it("should sign a hash", async () => {
        const transport = await Transport.create()
        const flare = new FlareApp(transport)
        const msg = "0xdeadbeef"
        const data = Buffer.from(unPrefix0x(ethers.sha256(msg)), 'hex')

        const sigResp = await flare.signHash(CCHAIN_PATH, data)
        const signature = {
            r: sigResp.r!,
            s: sigResp.s!
        }

        console.log(sigResp)
        
        const pubkResp = await flare.getEVMAddress(CCHAIN_PATH, false)
        console.log(pubkResp)
        const pubk = secpk256k1.keyFromPublic(prefix0x(pubkResp.publicKey!))
        assert(pubk.verify(data, signature))
    })
})