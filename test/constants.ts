import { getAddress } from 'ethers'

export const PCHAIN_PATH = "m/44'/9000'/0'/0/0"
export const CCHAIN_PATH = "m/44'/60'/0'/0'/5"

export const ERC20_ABI = [{
  "inputs": [
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "transfer",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "deposit",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "_recipient",
      "type": "address"
    }
  ],
  "name": "depositTo",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}]

export const FLR_RPC = 'https://flare.space/frpc1'
export const WRAPPED_FLARE_ADDRESS = getAddress('0x1d80c49bbbcd1c0911346656b529df9e5c2f783d')
export const RECEIVER_ADDRESS = getAddress('0xdf073477da421520cf03af261b782282c304ad66')