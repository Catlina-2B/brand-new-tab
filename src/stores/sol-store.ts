import { defineStore } from 'pinia';
import { Keypair } from '@solana/web3.js';

enum NetworkRPC {
  DEV = 'https://api.devnet.solana.com',
  MAINNET = 'https://api.mainnet-beta.solana.com',
}

interface SolStoreState {
  rpcUrl: string;
  isDevNetwork: boolean;
  currentAccount: Keypair | null;
}

export const useSolStore = defineStore('solStore', {
  state: (): SolStoreState => ({
    rpcUrl: NetworkRPC.DEV,
    isDevNetwork: true,
    currentAccount: null,
  }),
  getters: {
    getRpcUrl: (state) => state.rpcUrl,
    getIsDevNetwork: (state) => state.isDevNetwork,
    getCurrentAccount: (state) => state.currentAccount,
  },
  actions: {
    setRpcUrl(url: string) {
      this.rpcUrl = url;
    },
    setIsDevNetwork(isDevNetwork: boolean) {
      this.isDevNetwork = isDevNetwork;
      this.rpcUrl = isDevNetwork ? NetworkRPC.DEV : NetworkRPC.MAINNET;
    },
    setCurrentAccount(account: Keypair | null) {
      this.currentAccount = account;
    },
  },
});
