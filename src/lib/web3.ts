import { ethers } from 'ethers';

export const SUPPORTED_TOKENS = {
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    address: null,
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
} as const;

export function formatAmount(amount: string, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseAmount(amount: string, decimals: number): string {
  return ethers.parseUnits(amount, decimals).toString();
}

export function formatEther(amount: string): string {
  return ethers.formatEther(amount);
}

export function parseEther(amount: string): string {
  return ethers.parseEther(amount).toString();
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

export async function getEthPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}

export async function getUsdcPrice(): Promise<number> {
  return 1;
}

export function calculateFiatEquivalent(amount: string, tokenPrice: number, decimals: number): string {
  const amountFloat = parseFloat(formatAmount(amount, decimals));
  const fiat = amountFloat * tokenPrice;
  return fiat.toFixed(2);
}

export async function estimateGas(provider: ethers.BrowserProvider, transaction: any): Promise<bigint> {
  try {
    return await provider.estimateGas(transaction);
  } catch (error) {
    console.error('Error estimating gas:', error);
    return BigInt(21000);
  }
}

export function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
  };

  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

export const CROWDFUNDING_CONTRACT_ABI = [
  'function createCampaign(uint256 goal, uint256 deadline) external returns (uint256)',
  'function pledge(uint256 campaignId) external payable',
  'function withdraw(uint256 campaignId) external',
  'function refund(uint256 campaignId) external',
  'function getCampaign(uint256 campaignId) external view returns (address, uint256, uint256, uint256, uint256, bool, bool)',
  'event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint256 goal, uint256 deadline)',
  'event Pledged(uint256 indexed campaignId, address indexed pledger, uint256 amount)',
  'event Withdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount)',
  'event Refunded(uint256 indexed campaignId, address indexed pledger, uint256 amount)',
];

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];
