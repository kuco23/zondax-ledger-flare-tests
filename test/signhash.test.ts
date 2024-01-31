import { ethers } from 'ethers'
import Transport from '@ledgerhq/hw-transport-node-hid'
import FlareApp from '@zondax/ledger-flare'
import { PCHAIN_PATH } from './constants'
import { unPrefix0x, prefix0x } from './utils'

import { ec } from 'elliptic'
import { assert } from 'console'

const secpk256k1 = new ec('secp256k1')


describe("Zondax sign hash", () => {
    it("should sign a hash", async () => {
        const transport = await Transport.create()
        const flare = new FlareApp(transport)
        const data = Buffer.from(unPrefix0x(ethers.sha256("0xdeadbeef")), 'hex')
        const hash = Buffer.from(unPrefix0x(ethers.sha256(data)), 'hex')

        const sigResp = await flare.signHash(PCHAIN_PATH, data)
        const signature = {
            r: sigResp.r!,
            s: sigResp.s!
        }
        
        const pubkResp = await flare.getAddressAndPubKey(PCHAIN_PATH)
        const pubk = secpk256k1.keyFromPublic(pubkResp.compressed_pk!)

        const ok = pubk.verify(data, signature)
        console.log(ok)
    })
})