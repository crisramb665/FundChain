import { Rocket } from 'lucide-react';
import { ConnectWallet } from './ConnectWallet';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  return (
    <header className="bg-gray-950/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors group"
            >
              <div className="relative">
                <Rocket className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                FundChain
              </span>
            </button>

            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === 'home'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Explorar
              </button>
              <button
                onClick={() => onNavigate('create')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === 'create'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Crear Campaña
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mis Campañas
              </button>
            </nav>
          </div>

          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
