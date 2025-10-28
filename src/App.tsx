import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'create' | 'campaign' | 'dashboard' | 'admin';

interface NavigationState {
  page: Page;
  data?: any;
}

function App() {
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'home' });

  const handleNavigate = (page: string, data?: any) => {
    setNavigation({ page: page as Page, data });
  };

  const renderPage = () => {
    switch (navigation.page) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'create':
        return <CreateCampaignPage onNavigate={handleNavigate} />;
      case 'campaign':
        return (
          <CampaignDetailPage
            campaignId={navigation.data?.campaignId}
            onNavigate={handleNavigate}
          />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <Web3Provider>
        <div className="min-h-screen bg-gray-50">
          <Header onNavigate={handleNavigate} currentPage={navigation.page} />
          {renderPage()}
        </div>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
