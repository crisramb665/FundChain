import { useState, useEffect } from 'react';
import { X, DollarSign, ExternalLink } from 'lucide-react';
import { Campaign, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { parseAmount, getEthPrice, getUsdcPrice, calculateFiatEquivalent, getExplorerUrl } from '../lib/web3';

interface PledgeModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export function PledgeModal({ campaign, onClose, onSuccess }: PledgeModalProps) {
  const { user } = useAuth();
  const { account, chainId, connectWallet } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [fiatEstimate, setFiatEstimate] = useState('0.00');
  const [tokenPrice, setTokenPrice] = useState(0);

  const presetAmounts = campaign.token === 'ETH'
    ? ['0.01', '0.05', '0.1', '0.5']
    : ['10', '50', '100', '500'];

  useEffect(() => {
    loadTokenPrice();
  }, [campaign.token]);

  useEffect(() => {
    if (amount && tokenPrice > 0) {
      const decimals = campaign.token === 'ETH' ? 18 : 6;
      try {
        const amountWei = parseAmount(amount, decimals);
        const fiat = calculateFiatEquivalent(amountWei, tokenPrice, decimals);
        setFiatEstimate(fiat);
      } catch {
        setFiatEstimate('0.00');
      }
    } else {
      setFiatEstimate('0.00');
    }
  }, [amount, tokenPrice, campaign.token]);

  const loadTokenPrice = async () => {
    if (campaign.token === 'ETH') {
      const price = await getEthPrice();
      setTokenPrice(price);
    } else {
      const price = await getUsdcPrice();
      setTokenPrice(price);
    }
  };

  const handlePledge = async () => {
    if (!user || !account) {
      await connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const decimals = campaign.token === 'ETH' ? 18 : 6;
      const amountWei = parseAmount(amount, decimals);

      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      setTxHash(mockTxHash);

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

      const { error: pledgeError } = await supabase.from('pledges').insert({
        campaign_id: campaign.id,
        backer_id: user.id,
        amount: amountWei,
        token: campaign.token,
        tx_hash: mockTxHash,
        status: 'confirmed',
      });

      if (pledgeError) throw pledgeError;

      const newTotal = (BigInt(campaign.total_pledged) + BigInt(amountWei)).toString();
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({
          total_pledged: newTotal,
          backer_count: campaign.backer_count + 1,
        })
        .eq('id', campaign.id);

      if (campaignError) throw campaignError;

      await supabase.from('activity_log').insert({
        campaign_id: campaign.id,
        user_id: user.id,
        event_type: 'pledged',
        data: { amount, token: campaign.token },
      });

      setTimeout(() => {
        alert('Pledge successful!');
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Error pledging:', error);
      alert('Failed to pledge. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Back This Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!txHash ? (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Pledge Amount ({campaign.token})</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              {fiatEstimate !== '0.00' && (
                <p className="text-sm text-gray-500 mt-2">≈ ${fiatEstimate} USD</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This is a demo. In production, this would trigger a real Web3 transaction to the smart contract.
              </p>
            </div>

            <button
              onClick={handlePledge}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Pledge'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900">Transaction Submitted!</h3>
            <p className="text-gray-600">Your pledge is being processed</p>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
              <p className="text-sm text-gray-900 font-mono break-all">{txHash}</p>
            </div>

            {chainId && (
              <a
                href={getExplorerUrl(chainId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
