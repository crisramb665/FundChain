import { useEffect, useState } from 'react';
import { Rocket, Shield, Zap, ArrowRight, Search } from 'lucide-react';
import { supabase, Campaign } from '../lib/supabase';
import { CampaignCard } from '../components/CampaignCard';

interface LandingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'event' | 'preorder' | 'donation'>('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, profiles(*)')
      .eq('moderation_status', 'approved')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || campaign.campaign_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Recauda rápido.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-200 mt-2">
                Transparente. En Scroll L2.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
              Crea campañas con objetivo y duración. Recibe pledges on-chain con bajas comisiones. Simple y transparente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('create')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <Rocket className="w-5 h-5" />
                <span>Crear campaña</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition-all font-semibold text-lg"
              >
                Ver campañas
              </button>
            </div>
            <div className="mt-8 text-sm text-gray-300">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full">
                Alpha en Scroll Testnet
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguro y Transparente</h3>
              <p className="text-gray-600">
                Todas las transacciones on-chain con total transparencia. Tus fondos protegidos por smart contracts.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <Zap className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rápido y Fácil</h3>
              <p className="text-gray-600">
                Lanza tu campaña en minutos. Acepta ETH y USDC con comisiones mínimas en Scroll L2.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <Rocket className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alcance Global</h3>
              <p className="text-gray-600">
                Llega a backers en todo el mundo. Sin límites geográficos, sin intermediarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="campaigns" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Campañas Activas</h2>
              <p className="text-gray-600">Descubre proyectos buscando apoyo</p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar campañas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="event">Eventos</option>
                <option value="preorder">Pre-órdenes</option>
                <option value="donation">Donaciones</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600" />
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={() => onNavigate('campaign', { campaignId: campaign.id })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No se encontraron campañas que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
