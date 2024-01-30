import { ethers } from 'ethers'
import { assert } from 'console'
import Transport from '@ledgerhq/hw-transport-node-hid'
import FlareApp from '@zondax/ledger-flare'
import { PCHAIN_PATH } from './constants'
import { unPrefix0x, prefix0x } from './utils'

import { ec } from 'elliptic'

const secpk256k1 = new ec('secp256k1')


describe("Zondax sign hash", () => {
    it("should sign a hash", async () => {
        const transport = await Transport.create()
        const flare = new FlareApp(transport)
        const data = "0xdeadbeef"
        const hash = ethers.sha256(data)

        const addressAndPubKey = await flare.getAddressAndPubKey(PCHAIN_PATH)
        const publicKey = addressAndPubKey.compressed_pk!.toString('hex')
        const address = ethers.computeAddress(prefix0x(publicKey))

        const resp = await flare.signHash(PCHAIN_PATH, Buffer.from(unPrefix0x(hash), 'hex'))
        const rsv = { 
            r: prefix0x(resp.r!.toString('hex')), 
            s: prefix0x(resp.s!.toString('hex')), 
            v: prefix0x(resp.v!.toString('hex'))
        }
        
        const b = secpk256k1.verify(hash, rsv, Buffer.from(publicKey))
        console.log(b)
    })
})