import { useEffect, useState } from 'react';
import { Rocket, Shield, Zap, ArrowRight, Search, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAllCampaigns, Campaign } from '../lib/contract';
import { CampaignCard } from '../components/CampaignCard';
import { ethers } from 'ethers';

interface LandingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await fetchAllCampaigns();
    setCampaigns(data.filter(c => c.isActive));
    setLoading(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    return campaign.isActive;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" style={{ backgroundSize: '50px 50px' }} />

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />

        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 animate-float">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">{t('landing.hero.poweredBy')}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white">
                {t('landing.hero.title1')}
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-shimmer" style={{
                backgroundSize: '200% auto',
              }}>
                {t('landing.hero.title2')}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => onNavigate('create')}
                className="group relative flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 font-semibold text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Rocket className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t('landing.hero.createButton')}</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-cyan-400/50 transition-all font-semibold text-lg"
              >
                <span>{t('landing.hero.exploreButton')}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{t('landing.hero.alphaStatus')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" style={{ backgroundSize: '50px 50px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-cyan-400/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/30 rounded-2xl mb-6 group-hover:animate-float">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.secure.title')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('landing.features.secure.description')}
                </p>
              </div>
            </div>

            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-purple-400/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-400/30 rounded-2xl mb-6 group-hover:animate-float">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.fast.title')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('landing.features.fast.description')}
                </p>
              </div>
            </div>

            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-pink-400/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400/20 to-pink-600/20 border border-pink-400/30 rounded-2xl mb-6 group-hover:animate-float">
                  <Rocket className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.global.title')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('landing.features.global.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="campaigns" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
                {t('landing.campaigns.title')}
              </h2>
              <p className="text-gray-400 text-lg">{t('landing.campaigns.subtitle')}</p>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('landing.campaigns.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 text-white transition-all"
              >
                <option value="all" className="bg-gray-900">{t('landing.campaigns.filterAll')}</option>
                <option value="event" className="bg-gray-900">{t('landing.campaigns.filterEvent')}</option>
                <option value="preorder" className="bg-gray-900">{t('landing.campaigns.filterPreorder')}</option>
                <option value="donation" className="bg-gray-900">{t('landing.campaigns.filterDonation')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
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
            <div className="text-center py-32">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-6">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-500 text-xl">{t('landing.campaigns.noCampaigns')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
