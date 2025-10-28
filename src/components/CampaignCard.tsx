import { Calendar, Users, TrendingUp } from 'lucide-react';
import { Campaign } from '../lib/supabase';
import { ProgressBar } from './ProgressBar';
import { formatAmount } from '../lib/web3';

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const decimals = campaign.token === 'ETH' ? 18 : 6;
  const deadline = new Date(campaign.deadline);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    successful: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {campaign.image_url && (
        <div className="relative h-48 overflow-hidden bg-gray-900">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors">
              {campaign.title}
            </h3>
            <p className="text-sm text-gray-400 capitalize inline-block px-2 py-1 bg-white/5 rounded-lg">
              {campaign.campaign_type}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[campaign.status]} whitespace-nowrap`}>
            {campaign.status}
          </span>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        <ProgressBar
          current={campaign.total_pledged}
          goal={campaign.goal_amount}
          decimals={decimals}
        />

        <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-white/10">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{campaign.backer_count}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>{daysLeft}d</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span className="font-medium text-white">{campaign.token}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
