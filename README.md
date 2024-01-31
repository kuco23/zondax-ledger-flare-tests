Go to [zondax](https://hub.zondax.ch/) and install the latest Flare ledger app on your device.
Then fund the accounts on your ledger derivation paths `m/44'/9000'/0'/0/0` and `m/44'/60'/0'/0'/5` with some FLR,
and run the tests individually with `yarn test pchain.test.ts` and `yarn test cchain.test.ts`.

C-Chain transactions are ran consecutively, so you have to wait for the nonce increase inbetween, 
which takes some time because for some reason tx fees are set to low when building legacy transactions (zondax doesn't yet support clear signing for non-legacy).