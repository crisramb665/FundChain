import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  Share2,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { supabase, Campaign, Pledge } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar } from '../components/ProgressBar';
import { ActivityFeed } from '../components/ActivityFeed';
import { PledgeModal } from '../components/PledgeModal';
import { formatAmount } from '../lib/web3';

interface CampaignDetailPageProps {
  campaignId: string;
  onNavigate: (page: string) => void;
}

export function CampaignDetailPage({ campaignId, onNavigate }: CampaignDetailPageProps) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPledgeModal, setShowPledgeModal] = useState(false);

  useEffect(() => {
    loadCampaign();
    loadPledges();

    const subscription = supabase
      .channel(`campaign:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${campaignId}`,
        },
        (payload) => {
          setCampaign(payload.new as Campaign);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pledges',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          loadPledges();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId]);

  const loadCampaign = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, profiles(*)')
      .eq('id', campaignId)
      .single();

    if (!error && data) {
      setCampaign(data);
    }
    setLoading(false);
  };

  const loadPledges = async () => {
    const { data } = await supabase
      .from('pledges')
      .select('*, profiles(*)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (data) {
      setPledges(data);
    }
  };

  const handleWithdraw = async () => {
    if (!campaign || !user) return;

    const confirmed = confirm(
      'Are you sure you want to withdraw funds? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'successful' })
        .eq('id', campaign.id);

      if (error) throw error;

      await supabase.from('activity_log').insert({
        campaign_id: campaign.id,
        user_id: user.id,
        event_type: 'withdrawn',
        data: { amount: campaign.total_pledged, token: campaign.token },
      });

      alert('Withdrawal initiated successfully!');
      loadCampaign();
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw. Please try again.');
    }
  };

  const handleRefund = async () => {
    if (!campaign || !user) return;

    const confirmed = confirm('Are you sure you want to claim your refund?');
    if (!confirmed) return;

    try {
      await supabase.from('activity_log').insert({
        campaign_id: campaign.id,
        user_id: user.id,
        event_type: 'refunded',
        data: {},
      });

      alert('Refund claimed successfully!');
    } catch (error) {
      console.error('Error claiming refund:', error);
      alert('Failed to claim refund. Please try again.');
    }
  };

  const exportPledges = () => {
    if (!campaign) return;

    const csv = [
      ['Backer', 'Amount', 'Token', 'Date', 'Status'],
      ...pledges.map((p) => [
        p.profiles?.wallet_address || 'Unknown',
        formatAmount(p.amount, p.token === 'ETH' ? 18 : 6),
        p.token,
        new Date(p.created_at).toLocaleString(),
        p.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign.id}-pledges.csv`;
    a.click();
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <button
            onClick={() => onNavigate('home')}
            className="text-blue-600 hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const deadline = new Date(campaign.deadline);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isActive = campaign.status === 'active' && daysLeft > 0;
  const isOrganizer = user?.id === campaign.organizer_id;
  const canWithdraw = isOrganizer && campaign.status === 'active' && daysLeft <= 0;
  const canRefund = !isOrganizer && campaign.status === 'failed';
  const decimals = campaign.token === 'ETH' ? 18 : 6;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {campaign.image_url && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-2 capitalize">
                      {campaign.campaign_type}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                    <p className="text-gray-600">
                      by {campaign.profiles?.display_name || 'Anonymous Organizer'}
                    </p>
                  </div>
                  <button
                    onClick={copyShareLink}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
                <ActivityFeed campaignId={campaign.id} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <ProgressBar
                  current={campaign.total_pledged}
                  goal={campaign.goal_amount}
                  decimals={decimals}
                />

                <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{campaign.backer_count}</p>
                    <p className="text-xs text-gray-600">Backers</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{daysLeft}</p>
                    <p className="text-xs text-gray-600">Days Left</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{campaign.token}</p>
                    <p className="text-xs text-gray-600">Token</p>
                  </div>
                </div>

                {isActive && (
                  <button
                    onClick={() => setShowPledgeModal(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Back This Campaign
                  </button>
                )}

                {canWithdraw && (
                  <button
                    onClick={handleWithdraw}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Withdraw Funds</span>
                  </button>
                )}

                {canRefund && (
                  <button
                    onClick={handleRefund}
                    className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    Claim Refund
                  </button>
                )}

                {!isActive && !canWithdraw && !canRefund && (
                  <div className="text-center py-3 text-gray-600">
                    <p className="font-medium">
                      {campaign.status === 'successful' && 'Campaign Successful'}
                      {campaign.status === 'failed' && 'Campaign Failed'}
                      {campaign.status === 'cancelled' && 'Campaign Cancelled'}
                    </p>
                  </div>
                )}

                {isOrganizer && (
                  <button
                    onClick={exportPledges}
                    className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Pledges</span>
                  </button>
                )}

                {campaign.contract_id && (
                  <a
                    href={`https://etherscan.io/address/${campaign.contract_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Etherscan</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPledgeModal && (
        <PledgeModal
          campaign={campaign}
          onClose={() => setShowPledgeModal(false)}
          onSuccess={() => {
            setShowPledgeModal(false);
            loadCampaign();
            loadPledges();
          }}
        />
      )}
    </>
  );
}
