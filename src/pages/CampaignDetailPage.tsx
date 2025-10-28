import { useEffect, useState } from 'react';
import {
  Calendar,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Wallet,
  XCircle,
} from 'lucide-react';
import { fetchCampaign, fetchMyPledge, pledgeToContractETH, withdrawFromContract, refundFromContract, Campaign as ContractCampaign } from '../lib/contract';
import { useWeb3 } from '../contexts/Web3Context';
import { ProgressBar } from '../components/ProgressBar';
import { ethers } from 'ethers';

interface CampaignDetailPageProps {
  campaignId: number;
  onNavigate: (page: string) => void;
}

export function CampaignDetailPage({ campaignId, onNavigate }: CampaignDetailPageProps) {
  const { account, connectWallet } = useWeb3();
  const [campaign, setCampaign] = useState<ContractCampaign | null>(null);
  const [myPledge, setMyPledge] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [pledging, setPledging] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [campaignId, account]);

  const loadCampaign = async () => {
    setLoading(true);
    const data = await fetchCampaign(campaignId);
    if (data) {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(data.endAt);
      const daysLeft = Math.max(0, Math.ceil((endTime - now) / (24 * 60 * 60)));
      const isActive = now < endTime && !data.claimed;
      const progressPercentage = data.goal > 0n ? Number((data.pledged * 100n) / data.goal) : 0;

      setCampaign({
        id: campaignId,
        ...data,
        progressPercentage,
        daysLeft,
        isActive,
      });

      if (account) {
        const pledge = await fetchMyPledge(campaignId, account);
        setMyPledge(pledge);
      }
    }
    setLoading(false);
  };

  const handlePledge = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!pledgeAmount || !campaign) return;

    setPledging(true);
    try {
      const result = await pledgeToContractETH(campaignId, pledgeAmount);

      if (result.success) {
        alert(`Pledge successful!\n\nTransaction: ${result.txHash}\n\nView on explorer: https://sepolia.scrollscan.com/tx/${result.txHash}`);
        setPledgeAmount('');
        await loadCampaign();
      } else {
        alert(`Pledge failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error pledging:', error);
      alert(`Error: ${error.message || 'Failed to pledge'}`);
    } finally {
      setPledging(false);
    }
  };

  const handleWithdraw = async () => {
    if (!campaign || !account) return;

    const confirmed = confirm(
      'Are you sure you want to withdraw funds? This will claim all pledged funds to your wallet.'
    );
    if (!confirmed) return;

    setWithdrawing(true);
    try {
      const result = await withdrawFromContract(campaignId);

      if (result.success) {
        alert(`Withdrawal successful!\n\nTransaction: ${result.txHash}\n\nView on explorer: https://sepolia.scrollscan.com/tx/${result.txHash}`);
        await loadCampaign();
      } else {
        alert(`Withdrawal failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      alert(`Error: ${error.message || 'Failed to withdraw'}`);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRefund = async () => {
    if (!campaign || !account) return;

    const confirmed = confirm('Are you sure you want to claim your refund?');
    if (!confirmed) return;

    setRefunding(true);
    try {
      const result = await refundFromContract(campaignId);

      if (result.success) {
        alert(`Refund successful!\n\nTransaction: ${result.txHash}\n\nView on explorer: https://sepolia.scrollscan.com/tx/${result.txHash}`);
        await loadCampaign();
      } else {
        alert(`Refund failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error refunding:', error);
      alert(`Error: ${error.message || 'Failed to refund'}`);
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Campaign Not Found</h2>
          <button
            onClick={() => onNavigate('home')}
            className="text-cyan-400 hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = account?.toLowerCase() === campaign.owner.toLowerCase();
  const canWithdraw = isOwner && !campaign.isActive && campaign.pledged >= campaign.goal && !campaign.claimed;
  const canRefund = !isOwner && !campaign.isActive && campaign.pledged < campaign.goal && myPledge > 0n;
  const tokenSymbol = campaign.token === ethers.ZeroAddress ? 'ETH' : 'ERC20';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Campaigns</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      campaign.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : campaign.claimed
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.isActive ? 'Active' : campaign.claimed ? 'Claimed' : 'Ended'}
                    </span>
                    {campaign.approved && (
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                        Approved
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3">Campaign #{campaign.id}</h1>
                  <p className="text-gray-400">
                    by {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Start Date</span>
                  <span className="text-white font-medium">
                    {new Date(Number(campaign.startAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-400">End Date</span>
                  <span className="text-white font-medium">
                    {new Date(Number(campaign.endAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Token</span>
                  <span className="text-white font-medium">{tokenSymbol}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Contract Address</span>
                  <a
                    href={`https://sepolia.scrollscan.com/address/${campaign.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <span>{campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {myPledge > 0n && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Your Pledge</h3>
                </div>
                <p className="text-3xl font-bold text-cyan-400">
                  {ethers.formatEther(myPledge)} {tokenSymbol}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
              <ProgressBar
                current={campaign.pledged.toString()}
                goal={campaign.goal.toString()}
                decimals={18}
              />

              <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{campaign.daysLeft}</p>
                  <p className="text-xs text-gray-400">Days Left</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{campaign.progressPercentage}%</p>
                  <p className="text-xs text-gray-400">Funded</p>
                </div>
              </div>

              {campaign.isActive && !campaign.approved && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-300 font-medium mb-1">Campaign Pending Approval</p>
                  <p className="text-xs text-yellow-400">
                    This campaign is awaiting approval from the contract owner before accepting pledges
                  </p>
                </div>
              )}

              {campaign.isActive && campaign.approved && (
                <div className="space-y-3">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    placeholder={`Amount in ${tokenSymbol}`}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                  />
                  <button
                    onClick={handlePledge}
                    disabled={pledging || !pledgeAmount}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {pledging ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Pledging...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>Back This Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {canWithdraw && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Withdrawing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Withdraw Funds</span>
                    </>
                  )}
                </button>
              )}

              {canRefund && (
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refunding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Refunding...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Claim Refund</span>
                    </>
                  )}
                </button>
              )}

              {!campaign.isActive && !canWithdraw && !canRefund && (
                <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {campaign.claimed ? 'Campaign funds have been claimed' : 'Campaign has ended'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
