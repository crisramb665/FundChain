import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import {
  createCampaignOnChain,
  pledgeToContractETH,
  withdrawFromContract,
  refundFromContract,
  cancelCampaignOnChain,
  fetchCampaign,
  fetchMyPledge,
  CampaignData,
} from '../lib/contract';

export function useContract() {
  const { account, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (
    goal: string,
    durationDays: number,
    token: string = '',
    maxPledge: string = '0'
  ) => {
    if (!account) {
      setError('Please connect your wallet');
      return null;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Scroll Sepolia network');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const durationSeconds = durationDays * 24 * 60 * 60;
      const result = await createCampaignOnChain(goal, durationSeconds, token, maxPledge);

      if (!result.success) {
        setError(result.error || 'Failed to create campaign');
        return null;
      }

      return {
        txHash: result.txHash,
        campaignId: result.campaignId,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pledge = async (campaignId: number, amount: string) => {
    if (!account) {
      setError('Please connect your wallet');
      return null;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Scroll Sepolia network');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pledgeToContractETH(campaignId, amount);

      if (!result.success) {
        setError(result.error || 'Failed to pledge');
        return null;
      }

      return { txHash: result.txHash };
    } catch (err: any) {
      setError(err.message || 'Failed to pledge');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (campaignId: number) => {
    if (!account) {
      setError('Please connect your wallet');
      return null;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Scroll Sepolia network');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await withdrawFromContract(campaignId);

      if (!result.success) {
        setError(result.error || 'Failed to withdraw');
        return null;
      }

      return { txHash: result.txHash };
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refund = async (campaignId: number) => {
    if (!account) {
      setError('Please connect your wallet');
      return null;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Scroll Sepolia network');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await refundFromContract(campaignId);

      if (!result.success) {
        setError(result.error || 'Failed to refund');
        return null;
      }

      return { txHash: result.txHash };
    } catch (err: any) {
      setError(err.message || 'Failed to refund');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelCampaign = async (campaignId: number) => {
    if (!account) {
      setError('Please connect your wallet');
      return null;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Scroll Sepolia network');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await cancelCampaignOnChain(campaignId);

      if (!result.success) {
        setError(result.error || 'Failed to cancel campaign');
        return null;
      }

      return { txHash: result.txHash };
    } catch (err: any) {
      setError(err.message || 'Failed to cancel campaign');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCampaign = async (campaignId: number): Promise<CampaignData | null> => {
    try {
      return await fetchCampaign(campaignId);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      return null;
    }
  };

  const getMyPledge = async (campaignId: number): Promise<bigint> => {
    if (!account) return 0n;

    try {
      return await fetchMyPledge(campaignId, account);
    } catch (err) {
      console.error('Error fetching pledge:', err);
      return 0n;
    }
  };

  return {
    loading,
    error,
    createCampaign,
    pledge,
    withdraw,
    refund,
    cancelCampaign,
    getCampaign,
    getMyPledge,
  };
}
