import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import { fetchAllCampaigns, approveCampaignOnChain, checkModerationRequired, Campaign } from '../lib/contract';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../lib/scroll-config';

interface AdminPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { account, connectWallet } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderationRequired, setModerationRequired] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [isContractOwner, setIsContractOwner] = useState(false);

  useEffect(() => {
    loadCampaigns();
    checkIfOwner();
  }, [account]);

  const checkIfOwner = async () => {
    if (!account) return;

    const modRequired = await checkModerationRequired();
    setModerationRequired(modRequired);

    setIsContractOwner(true);
  };

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await fetchAllCampaigns();
    const unapprovedCampaigns = data.filter(c => !c.approved);
    setCampaigns(unapprovedCampaigns);
    setLoading(false);
  };

  const handleApprove = async (campaignId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to approve Campaign #${campaignId}? This will allow users to pledge funds.`
    );
    if (!confirmed) return;

    setProcessing(campaignId);
    try {
      const result = await approveCampaignOnChain(campaignId);

      if (result.success) {
        alert(`Campaign approved successfully!\n\nTransaction: ${result.txHash}\n\nView on explorer: https://sepolia.scrollscan.com/tx/${result.txHash}`);
        await loadCampaigns();
      } else {
        alert(`Approval failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error approving campaign:', error);
      alert(`Error: ${error.message || 'Failed to approve campaign'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to access the admin panel</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Campaign Approval Panel</h1>
            </div>
            {isContractOwner && (
              <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                Contract Owner
              </span>
            )}
          </div>
          <p className="text-purple-100">Review and approve campaigns to allow users to pledge funds</p>
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <span className="text-purple-200">Contract:</span>
            <code className="px-2 py-1 bg-black/20 rounded text-purple-100">
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </code>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Pending Approvals</span>
            </div>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
              {campaigns.length} campaigns
            </span>
          </div>
          {moderationRequired && (
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-purple-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Moderation is enabled - campaigns require approval before users can pledge</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-white">Campaign #{campaign.id}</h3>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                        Pending Approval
                      </span>
                      {campaign.isActive && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Owner</span>
                          <span className="text-white text-sm font-mono">
                            {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Goal</span>
                          <span className="text-white text-sm font-medium">
                            {ethers.formatEther(campaign.goal)} ETH
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Pledged</span>
                          <span className="text-white text-sm font-medium">
                            {ethers.formatEther(campaign.pledged)} ETH
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Start Date</span>
                          <span className="text-white text-sm">
                            {new Date(Number(campaign.startAt) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">End Date</span>
                          <span className="text-white text-sm">
                            {new Date(Number(campaign.endAt) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Days Left</span>
                          <span className="text-white text-sm font-medium">
                            {campaign.daysLeft} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">Progress</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(campaign.progressPercentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {campaign.progressPercentage}% funded
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-3">
                    <button
                      onClick={() => onNavigate('campaign', { campaignId: campaign.id })}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleApprove(campaign.id)}
                      disabled={processing === campaign.id}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === campaign.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Campaigns</h3>
            <p className="text-gray-400">All campaigns have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
}
