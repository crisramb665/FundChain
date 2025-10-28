import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { shortenAddress } from '../lib/web3';
import { useState } from 'react';

export function ConnectWallet() {
  const { account, connecting, connectWallet, disconnectWallet } = useWeb3();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    signOut();
    setShowMenu(false);
  };

  if (!account && !user) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">{account ? shortenAddress(account) : 'Connected'}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {account && (
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-xs text-gray-500">Wallet</p>
                <p className="text-sm font-medium text-gray-900">{shortenAddress(account)}</p>
              </div>
            )}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
