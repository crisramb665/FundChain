export const SCROLL_TESTNET = {
  chainId: 534351,
  chainIdHex: '0x8274f',
  name: 'Scroll Sepolia Testnet',
  rpcUrl: 'https://scroll-sepolia.drpc.org',
  blockExplorer: 'https://sepolia.scrollscan.com',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const CONTRACT_ADDRESS = '0x36Ff8406C4A54F8E7E3c7b8aAB7D9F4cF43e6f08';
export const CONTRACT_OWNER = '0xbc6b93f3aba28cd04b96c50b0f0ac53a24564718';

export const MAX_CAMPAIGN_GOAL = '2';
export const MAX_PLEDGE_AMOUNT = '1';

export async function addScrollNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: SCROLL_TESTNET.chainIdHex,
          chainName: SCROLL_TESTNET.name,
          nativeCurrency: SCROLL_TESTNET.nativeCurrency,
          rpcUrls: [SCROLL_TESTNET.rpcUrl],
          blockExplorerUrls: [SCROLL_TESTNET.blockExplorer],
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error adding Scroll network:', error);
    return false;
  }
}

export async function switchToScroll() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SCROLL_TESTNET.chainIdHex }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      return await addScrollNetwork();
    }
    console.error('Error switching to Scroll:', error);
    return false;
  }
}

export function isScrollNetwork(chainId: number): boolean {
  return chainId === SCROLL_TESTNET.chainId;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${SCROLL_TESTNET.blockExplorer}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${SCROLL_TESTNET.blockExplorer}/address/${address}`;
}
