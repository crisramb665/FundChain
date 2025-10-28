import { Calendar, TrendingUp } from 'lucide-react';
import { Campaign } from '../lib/contract';
import { ProgressBar } from './ProgressBar';
import { ethers } from 'ethers';

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const tokenSymbol = campaign.token === ethers.ZeroAddress ? 'ETH' : 'ERC20';
  const decimals = 18;

  const statusText = campaign.isActive ? 'Active' : campaign.claimed ? 'Claimed' : 'Ended';
  const statusColor = campaign.isActive
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : campaign.claimed
    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors">
              Campaign #{campaign.id}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-1">
              by {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColor} whitespace-nowrap`}>
            {statusText}
          </span>
        </div>

        <ProgressBar
          current={campaign.pledged.toString()}
          goal={campaign.goal.toString()}
          decimals={decimals}
        />

        <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-white/10">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>{campaign.daysLeft}d left</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span className="font-medium text-white">{tokenSymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
