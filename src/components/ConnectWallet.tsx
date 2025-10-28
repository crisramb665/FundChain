import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { shortenAddress } from '../lib/web3';
import { useState } from 'react';
import { SCROLL_TESTNET } from '../lib/scroll-config';

export function ConnectWallet() {
  const { account, connecting, error, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork } = useWeb3();
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
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4" />
          <span>{connecting ? 'Conectando...' : 'Conectar Wallet'}</span>
        </button>
        {error && (
          <div className="text-xs text-red-600 max-w-xs text-right">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {account && !isCorrectNetwork && (
        <button
          onClick={switchNetwork}
          className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Cambiar Red</span>
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isCorrectNetwork
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-medium">{account ? shortenAddress(account) : 'Conectado'}</span>
          {!isCorrectNetwork && <AlertTriangle className="w-4 h-4" />}
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {account && (
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Wallet</p>
                  <p className="text-sm font-medium text-gray-900">{shortenAddress(account)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Red: {isCorrectNetwork ? SCROLL_TESTNET.name : 'Red incorrecta'}
                  </p>
                </div>
              )}
              {!isCorrectNetwork && (
                <button
                  onClick={() => {
                    switchNetwork();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cambiar a Scroll Testnet</span>
                </button>
              )}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
