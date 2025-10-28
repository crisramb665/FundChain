import { Rocket } from 'lucide-react';
import { ConnectWallet } from './ConnectWallet';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <Rocket className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">FundChain</span>
            </button>

            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => onNavigate('create')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'create'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Create Campaign
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                My Campaigns
              </button>
            </nav>
          </div>

          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
