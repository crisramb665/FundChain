import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { supabase, Campaign } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AdminPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingCampaigns();
  }, []);

  const loadPendingCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, profiles(*)')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  const handleModeration = async (campaignId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    const confirmed = confirm(
      `Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} this campaign?`
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          moderation_status: status,
          moderation_notes: moderationNotes || null,
          status: status === 'approved' ? 'active' : 'cancelled',
        })
        .eq('id', campaignId);

      if (error) throw error;

      alert(`Campaign ${status} successfully!`);
      setSelectedCampaign(null);
      setModerationNotes('');
      loadPendingCampaigns();
    } catch (error) {
      console.error('Error moderating campaign:', error);
      alert('Failed to moderate campaign. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm p-8 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Moderation Panel</h1>
          </div>
          <p className="text-purple-100">Review and approve campaigns before they go live</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">{campaigns.length}</span>
                <span className="text-gray-600">Pending Review</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Pending Campaigns</h2>
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedCampaign?.id === campaign.id ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {campaign.profiles?.wallet_address?.slice(0, 10)}...
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full capitalize">
                      {campaign.campaign_type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {campaign.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Goal: {campaign.goal_amount} {campaign.token}</span>
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              {selectedCampaign ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-900">Review Campaign</h2>
                  </div>

                  <div className="space-y-4">
                    {selectedCampaign.image_url && (
                      <img
                        src={selectedCampaign.image_url}
                        alt={selectedCampaign.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCampaign.title}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                        {selectedCampaign.campaign_type}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {selectedCampaign.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Goal Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedCampaign.goal_amount} {selectedCampaign.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Deadline</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(selectedCampaign.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Moderation Notes (Optional)
                      </label>
                      <textarea
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        placeholder="Add any notes about your decision..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleModeration(selectedCampaign.id, 'rejected')}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>{processing ? 'Processing...' : 'Reject'}</span>
                      </button>
                      <button
                        onClick={() => handleModeration(selectedCampaign.id, 'approved')}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{processing ? 'Processing...' : 'Approve'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a campaign to review</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No campaigns pending review at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
