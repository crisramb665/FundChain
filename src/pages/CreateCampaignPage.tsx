import { useState, useEffect } from 'react';
import { Save, Eye, Calendar, DollarSign, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import { supabase } from '../lib/supabase';
import { parseEther, getEthPrice, getUsdcPrice, calculateFiatEquivalent } from '../lib/web3';

interface CreateCampaignPageProps {
  onNavigate: (page: string) => void;
}

export function CreateCampaignPage({ onNavigate }: CreateCampaignPageProps) {
  const { user } = useAuth();
  const { account, connectWallet, isCorrectNetwork } = useWeb3();
  const { createCampaign, loading: contractLoading, error: contractError } = useContract();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    token: 'ETH' as 'ETH' | 'USDC',
    deadline: '',
    campaignType: 'donation' as 'event' | 'preorder' | 'donation',
    imageUrl: '',
  });

  const [fiatEstimate, setFiatEstimate] = useState('0.00');
  const [tokenPrice, setTokenPrice] = useState(0);

  useEffect(() => {
    loadTokenPrice();
  }, [formData.token]);

  useEffect(() => {
    if (formData.goalAmount && tokenPrice > 0) {
      const decimals = formData.token === 'ETH' ? 18 : 6;
      try {
        const amount = parseEther(formData.goalAmount);
        const fiat = calculateFiatEquivalent(amount, tokenPrice, decimals);
        setFiatEstimate(fiat);
      } catch {
        setFiatEstimate('0.00');
      }
    } else {
      setFiatEstimate('0.00');
    }
  }, [formData.goalAmount, formData.token, tokenPrice]);

  const loadTokenPrice = async () => {
    if (formData.token === 'ETH') {
      const price = await getEthPrice();
      setTokenPrice(price);
    } else {
      const price = await getUsdcPrice();
      setTokenPrice(price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !account) {
      await connectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      alert('Please switch to Scroll Sepolia network to create a campaign');
      return;
    }

    setLoading(true);
    try {
      const deadline = new Date(formData.deadline);
      const now = new Date();
      const durationDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const contractResult = await createCampaign(
        formData.goalAmount,
        durationDays,
        '',
        '0'
      );

      if (!contractResult) {
        alert(contractError || 'Failed to create campaign on blockchain. Please try again.');
        setLoading(false);
        return;
      }

      const decimals = formData.token === 'ETH' ? 18 : 6;
      const goalAmountWei = parseEther(formData.goalAmount);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          wallet_address: account,
        });
      }

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          organizer_id: user.id,
          title: formData.title,
          description: formData.description,
          goal_amount: goalAmountWei,
          token: formData.token,
          deadline: deadline.toISOString(),
          campaign_type: formData.campaignType,
          image_url: formData.imageUrl || null,
          status: 'pending',
          moderation_status: 'pending',
          contract_id: contractResult.campaignId,
          contract_address: account,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_log').insert({
        campaign_id: campaign.id,
        user_id: user.id,
        event_type: 'created',
        data: {
          title: formData.title,
          txHash: contractResult.txHash,
          contractId: contractResult.campaignId,
        },
      });

      alert(`Campaign created successfully on-chain! Transaction: ${contractResult.txHash}\nYour campaign will be reviewed by our team.`);
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.goalAmount !== '' &&
      parseFloat(formData.goalAmount) > 0 &&
      formData.deadline !== '' &&
      new Date(formData.deadline) > new Date()
    );
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campaign Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Back to Edit
              </button>
            </div>

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Campaign preview"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-2">
                  {formData.campaignType}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{formData.title}</h1>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Goal Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formData.goalAmount} {formData.token}
                  </p>
                  <p className="text-sm text-gray-500">≈ ${fiatEstimate} USD</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Deadline</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(formData.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
            <p className="text-gray-600">
              Launch your crowdfunding campaign and start accepting pledges
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                <span>Campaign Title</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, descriptive title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell backers about your project. What are you building? Why does it matter?"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Goal Amount</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {fiatEstimate !== '0.00' && (
                  <p className="text-sm text-gray-500 mt-1">≈ ${fiatEstimate} USD</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Token</label>
                <select
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value as 'ETH' | 'USDC' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Campaign Type</label>
                <select
                  value={formData.campaignType}
                  onChange={(e) => setFormData({ ...formData, campaignType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="donation">Donation</option>
                  <option value="event">Event</option>
                  <option value="preorder">Pre-order</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image URL (Optional)</span>
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!isFormValid()}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>

              <button
                type="submit"
                disabled={!isFormValid() || loading || contractLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{(loading || contractLoading) ? 'Creating...' : 'Create Campaign'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
