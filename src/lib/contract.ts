import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, SCROLL_TESTNET } from './scroll-config';

export const CROWDFUND_ABI = [
  "constructor(uint256 _maxGoal, uint256 _maxPledge, bool _moderationRequired)",
  "function MAX_GOAL() view returns (uint256)",
  "function MAX_PLEDGE() view returns (uint256)",
  "function moderationRequired() view returns (bool)",
  "function campaigns(uint256) view returns (address owner, address token, uint256 goal, uint256 pledged, uint256 startAt, uint256 endAt, bool claimed, bool approved, uint256 maxPledge)",
  "function pledgedAmounts(uint256, address) view returns (uint256)",
  "function setMaxGoal(uint256 _maxGoal)",
  "function setMaxPledge(uint256 _maxPledge)",
  "function setModerationRequired(bool _required)",
  "function approveCampaign(uint256 _id)",
  "function createCampaign(uint256 _goal, uint256 _durationSeconds, address _token, uint256 _maxPledge) returns (uint256)",
  "function pledge(uint256 _id) payable",
  "function pledgeERC20(uint256 _id, uint256 _amount)",
  "function withdraw(uint256 _id)",
  "function refund(uint256 _id)",
  "function cancelCampaign(uint256 _id)",
  "function getCampaignsCount() view returns (uint256)",
  "function getCampaign(uint256 _id) view returns (address owner, address token, uint256 goal, uint256 pledged, uint256 startAt, uint256 endAt, bool claimed, bool approved, uint256 maxPledge)",
  "function getMyPledge(uint256 _id, address _backer) view returns (uint256)",
  "event CampaignCreated(uint256 indexed id, address indexed owner, address token, uint256 goal, uint256 startAt, uint256 endAt, uint256 maxPledge)",
  "event CampaignApproved(uint256 indexed id, address indexed approver)",
  "event Pledged(uint256 indexed id, address indexed backer, uint256 amount)",
  "event Withdrawn(uint256 indexed id, address indexed owner, uint256 amount)",
  "event Refunded(uint256 indexed id, address indexed backer, uint256 amount)",
  "event CampaignCancelled(uint256 indexed id, address indexed owner)"
];

export function getProvider() {
  return new ethers.JsonRpcProvider(SCROLL_TESTNET.rpcUrl);
}

export function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CROWDFUND_ABI, providerOrSigner);
}

export function getSigner() {
  if (!window.ethereum) {
    throw new Error('No ethereum provider found');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export async function getContractWithSigner() {
  const signer = await getSigner();
  return getContract(signer);
}

export interface CampaignData {
  owner: string;
  token: string;
  goal: bigint;
  pledged: bigint;
  startAt: bigint;
  endAt: bigint;
  claimed: boolean;
  approved: boolean;
  maxPledge: bigint;
}

export async function fetchCampaign(campaignId: number): Promise<CampaignData | null> {
  try {
    const contract = getContract();
    const data = await contract.getCampaign(campaignId);

    return {
      owner: data[0],
      token: data[1],
      goal: data[2],
      pledged: data[3],
      startAt: data[4],
      endAt: data[5],
      claimed: data[6],
      approved: data[7],
      maxPledge: data[8],
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export async function fetchCampaignsCount(): Promise<number> {
  try {
    const contract = getContract();
    const count = await contract.getCampaignsCount();
    return Number(count);
  } catch (error) {
    console.error('Error fetching campaigns count:', error);
    return 0;
  }
}

export async function fetchMyPledge(campaignId: number, backer: string): Promise<bigint> {
  try {
    const contract = getContract();
    const amount = await contract.getMyPledge(campaignId, backer);
    return amount;
  } catch (error) {
    console.error('Error fetching pledge:', error);
    return 0n;
  }
}

export async function createCampaignOnChain(
  goal: string,
  durationSeconds: number,
  token: string,
  maxPledge: string
): Promise<{ success: boolean; txHash?: string; campaignId?: number; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const goalWei = ethers.parseEther(goal);
    const maxPledgeWei = maxPledge ? ethers.parseEther(maxPledge) : 0n;

    const tx = await contract.createCampaign(
      goalWei,
      durationSeconds,
      token || ethers.ZeroAddress,
      maxPledgeWei
    );

    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'CampaignCreated');

    const campaignId = event ? Number(event.args[0]) : undefined;

    return {
      success: true,
      txHash: receipt.hash,
      campaignId,
    };
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: error.message || 'Failed to create campaign',
    };
  }
}

export async function pledgeToContractETH(
  campaignId: number,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const amountWei = ethers.parseEther(amount);

    const tx = await contract.pledge(campaignId, { value: amountWei });
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error pledging:', error);
    return {
      success: false,
      error: error.message || 'Failed to pledge',
    };
  }
}

export async function withdrawFromContract(
  campaignId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.withdraw(campaignId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error withdrawing:', error);
    return {
      success: false,
      error: error.message || 'Failed to withdraw',
    };
  }
}

export async function refundFromContract(
  campaignId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.refund(campaignId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error refunding:', error);
    return {
      success: false,
      error: error.message || 'Failed to refund',
    };
  }
}

export async function cancelCampaignOnChain(
  campaignId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.cancelCampaign(campaignId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error cancelling campaign:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel campaign',
    };
  }
}

export async function approveCampaignOnChain(
  campaignId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.approveCampaign(campaignId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error approving campaign:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve campaign',
    };
  }
}

export async function checkModerationRequired(): Promise<boolean> {
  try {
    const contract = getContract();
    const required = await contract.moderationRequired();
    return required;
  } catch (error) {
    console.error('Error checking moderation:', error);
    return false;
  }
}

export interface Campaign {
  id: number;
  owner: string;
  token: string;
  goal: bigint;
  pledged: bigint;
  startAt: bigint;
  endAt: bigint;
  claimed: boolean;
  approved: boolean;
  maxPledge: bigint;
  progressPercentage: number;
  daysLeft: number;
  isActive: boolean;
}

export async function fetchAllCampaigns(): Promise<Campaign[]> {
  try {
    const contract = getContract();
    const count = await contract.getCampaignsCount();
    const totalCount = Number(count);

    const campaigns: Campaign[] = [];

    for (let i = 0; i < totalCount; i++) {
      try {
        const data = await contract.getCampaign(i);
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(data[5]);
        const daysLeft = Math.max(0, Math.ceil((endTime - now) / (24 * 60 * 60)));
        const isActive = now < endTime && !data[6];

        const goal = data[2];
        const pledged = data[3];
        const progressPercentage = goal > 0n ? Number((pledged * 100n) / goal) : 0;

        campaigns.push({
          id: i,
          owner: data[0],
          token: data[1],
          goal,
          pledged,
          startAt: data[4],
          endAt: data[5],
          claimed: data[6],
          approved: data[7],
          maxPledge: data[8],
          progressPercentage,
          daysLeft,
          isActive,
        });
      } catch (error) {
        console.error(`Error fetching campaign ${i}:`, error);
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return [];
  }
}
