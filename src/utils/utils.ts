import { Theme, defaultTheme } from './const';

import { useQuasar } from 'quasar';

import { PinataSDK } from 'pinata-web3';

import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkOGM0Y2M2NS1iNGU0LTQ4YzAtYmY3Yi1jMzY5ZTgxYzg3OWYiLCJlbWFpbCI6ImNhdGxpbmExODZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjlkNDQ4NjdlOGRjMzdjMzg1MDM4Iiwic2NvcGVkS2V5U2VjcmV0IjoiMDliNmI5YWMzZjZmMDM3YmE2MGU4MmYwY2Y0NjE1NjJmMmIzZmRlM2YzNTEzMmRiNjg2ZjY4NGFlMTQwMTVkZSIsImV4cCI6MTc2ODI4ODM4NX0.A639VH2HJHMNfc8Q-1i6YOihvgdOSw92IJ4y6oqxQbc';
const gateway = 'scarlet-elderly-prawn-973.mypinata.cloud'

let raydium: Raydium | undefined;

export function switchTheme(themeName: string) {
  const $q = useQuasar();
  document.body.className = themeName;
  localStorage.setItem('theme', themeName);
  try {
    if (themeName == Theme.dark) {
      $q.dark.set(true);
    } else {
      $q.dark.set(false);
    }
  } catch (err) { }
}

export function getTheme() {
  return localStorage.getItem('theme') || defaultTheme;
}


export async function uploadFile(file: File) {
  const pinata = new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway,
  });
  try {
    const upload = await pinata.upload.file(file);
    const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash)
    return ipfsUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function uploadJson(json: any) {
  const pinata = new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway,
  });
  try {
    const upload = await pinata.upload.json(json);
    const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash)
    return ipfsUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const txVersion = TxVersion.LEGACY // or TxVersion.LEGACY

export const initSdk = async ({ loadToken, owner, connection, cluster }: { loadToken?: boolean, owner: Keypair, connection: Connection, cluster: 'devnet' | 'mainnet' }) => {
  if (raydium) return raydium
  if (connection.rpcEndpoint === clusterApiUrl('mainnet-beta'))
    console.warn('using free rpc node might cause unexpected error, strongly suggest uses paid rpc node')
  console.log(`connect to rpc ${connection?.rpcEndpoint} in ${cluster}`)
  raydium = await Raydium.load({
    owner: owner,
    connection: connection,
    cluster: cluster,
    disableFeatureCheck: true,
    disableLoadToken: !loadToken,
    blockhashCommitment: 'finalized',
    // urlConfigs: {
    //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
    // },
  })

  /**
   * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
   * if you want to handle token account by yourself, set token account data after init sdk
   * code below shows how to do it.
   * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
   */

  raydium.account.updateTokenAccount(await fetchTokenAccountData(connection, owner))
  connection.onAccountChange(owner.publicKey, async () => {
    raydium!.account.updateTokenAccount(await fetchTokenAccountData(connection, owner))
  })

  return raydium
}

export const fetchTokenAccountData = async (connection: Connection, owner: Keypair) => {
  const solAccountResp = await connection.getAccountInfo(owner.publicKey)
  const tokenAccountResp = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
  const token2022Req = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
  const tokenAccountData = parseTokenAccountResp({
    owner: owner.publicKey,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  })
  return tokenAccountData
}
