import { useEffect, useState } from 'react';
import { PlusCircle, BarChart3, Filter } from 'lucide-react';
import { fetchAllCampaigns, Campaign } from '../lib/contract';
import { useWeb3 } from '../contexts/Web3Context';
import { CampaignCard } from '../components/CampaignCard';

interface DashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { account } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');

  useEffect(() => {
    if (account) {
      loadCampaigns();
    }
  }, [account]);

  const loadCampaigns = async () => {
    if (!account) return;

    setLoading(true);
    const data = await fetchAllCampaigns();
    const myCampaigns = data.filter(c => c.owner.toLowerCase() === account.toLowerCase());
    setCampaigns(myCampaigns);
    setLoading(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return campaign.isActive;
    if (filterStatus === 'ended') return !campaign.isActive;
    return true;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.isActive).length,
    successful: campaigns.filter((c) => c.claimed).length,
    ended: campaigns.filter((c) => !c.isActive).length,
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-4">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Campaigns</h1>
            <p className="text-gray-400">Manage and track your crowdfunding campaigns</p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-sm text-gray-400">Total Campaigns</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.active}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.successful}</p>
            <p className="text-sm text-gray-400">Claimed</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.ended}</p>
            <p className="text-sm text-gray-400">Ended</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {(['all', 'active', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filterStatus === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => onNavigate('campaign', { campaignId: campaign.id })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? 'Start by creating your first campaign'
                : `No ${filterStatus} campaigns found`}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Your First Campaign</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
