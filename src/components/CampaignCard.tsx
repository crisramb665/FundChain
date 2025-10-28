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
    active: 'bg-green-100 text-green-800',
    successful: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      {campaign.image_url && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {campaign.title}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{campaign.campaign_type}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status]}`}>
            {campaign.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {campaign.description}
        </p>

        <ProgressBar
          current={campaign.total_pledged}
          goal={campaign.goal_amount}
          decimals={decimals}
        />

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{campaign.backer_count} backers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{daysLeft} days left</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{campaign.token}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
