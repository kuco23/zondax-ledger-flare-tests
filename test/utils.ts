import { ethers } from 'ethers'
import * as elliptic from "elliptic"
import { bech32 } from 'bech32'
import { BN } from '@flarenetwork/flarejs'

//////////////////////////////////////////////////////////////////////////////////////////
// public keys and bech32 addresses

const ec: elliptic.ec = new elliptic.ec("secp256k1")

export function privateKeyToEncodedPublicKey(privateKey: string, compress: boolean = true): string {
  const keyPair = ec.keyFromPrivate(privateKey)
  return keyPair.getPublic().encode("hex", compress)
}

export function privateKeyToPublicKey(privateKey: Buffer): Buffer[] {
  const keyPair = ec.keyFromPrivate(privateKey).getPublic()
  const x = keyPair.getX().toBuffer(undefined, 32)
  const y = keyPair.getY().toBuffer(undefined, 32)
  return [x, y]
}

export function decodePublicKey(publicKey: string): [Buffer, Buffer] {
  publicKey = unPrefix0x(publicKey)
  if (publicKey.length == 128) {
    publicKey = "04" + publicKey
  }
  const keyPair = ec.keyFromPublic(publicKey, 'hex').getPublic()
  const x = keyPair.getX().toBuffer(undefined, 32)
  const y = keyPair.getY().toBuffer(undefined, 32)
  return [x, y]
}

export function compressPublicKey(x: Buffer, y: Buffer): Buffer {
  return Buffer.from(
    ec.keyFromPublic({
      x: x.toString('hex'),
      y: y.toString('hex')
    }).getPublic().encode("hex", true),
    "hex")
}

export function publicKeyToBech32AddressBuffer(x: Buffer, y: Buffer) {
  const compressed = compressPublicKey(x, y)
  return ethers.ripemd160(ethers.sha256(compressed))
}

export function publicKeyToBech32AddressString(publicKey: string, hrp: string) {
  const [pubX, pubY] = decodePublicKey(publicKey)
  const address = publicKeyToBech32AddressBuffer(pubX, pubY)
  const addressBuffer = Buffer.from(unPrefix0x(address), 'hex')
  return `${bech32.encode(hrp, bech32.toWords(addressBuffer))}`
}

export function publicKeyToEthereumAddressString(publicKey: string) {
  const [pubX, pubY] = decodePublicKey(publicKey)
  const decompressedPubk = Buffer.concat([pubX, pubY]).toString('hex')
  return ethers.computeAddress(prefix0x(decompressedPubk))
}

export function unPrefix0x(tx: string) {
  if (!tx) {
    return '0x0'
  }
  return tx.startsWith('0x') ? tx.slice(2) : tx
}

export function prefix0x(tx: string) {
  if (!tx) {
      return '0x0'
  }
  return tx.startsWith('0x') ? tx : '0x' + tx
}

export async function sleep(milliseconds: number) {
  await new Promise((resolve: any) => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}
