import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { SCROLL_TESTNET, switchToScroll, isScrollNetwork } from '../lib/scroll-config';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();

  const isCorrectNetwork = chainId ? isScrollNetwork(chainId) : false;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      checkConnection();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chain, 16));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      updateProfileWallet(accounts[0]);
      setError(null);
    } else {
      setAccount(null);
      setError('Cuenta desconectada');
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);

    if (!isScrollNetwork(newChainId)) {
      setError(`Por favor, cambia a Scroll Testnet para usar la aplicación`);
    } else {
      setError(null);
    }
  };

  const updateProfileWallet = async (walletAddress: string) => {
    if (!user) return;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress })
        .eq('id', user.id);
    } else {
      await supabase
        .from('profiles')
        .insert({ id: user.id, wallet_address: walletAddress });
    }

    await refreshProfile();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Por favor instala MetaMask u otra wallet Web3 para continuar');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No se seleccionó ninguna cuenta');
      }

      setAccount(accounts[0]);

      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chain, 16);
      setChainId(currentChainId);

      if (!isScrollNetwork(currentChainId)) {
        setError('Red incorrecta. Cambiando a Scroll Testnet...');
        const switched = await switchToScroll();
        if (switched) {
          setError(null);
          const newChain = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(newChain, 16));
        } else {
          setError('No se pudo cambiar a Scroll Testnet. Por favor, cámbiala manualmente.');
        }
      }

      if (!user) {
        console.log('No user session found, creating one...');
        const email = `${accounts[0].toLowerCase()}@wallet.local`;
        const password = accounts[0].toLowerCase();

        let authData;
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.log('User does not exist, creating new account...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                wallet_address: accounts[0],
              },
            },
          });

          if (signUpError) {
            console.error('Error creating user:', signUpError);
            setError('Failed to create user session');
            return;
          }
          authData = signUpData;
        } else {
          authData = signInData;
        }

        if (authData.user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: authData.user.id,
              wallet_address: accounts[0],
            });
          } else {
            await supabase
              .from('profiles')
              .update({ wallet_address: accounts[0] })
              .eq('id', authData.user.id);
          }
        }
      } else {
        await updateProfileWallet(accounts[0]);
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('Conexión rechazada por el usuario');
      } else if (err.code === -32002) {
        setError('Ya hay una solicitud de conexión pendiente. Por favor, revisa tu wallet.');
      } else {
        setError('Error al conectar wallet. Por favor, intenta de nuevo.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const switchNetwork = async () => {
    setError(null);
    try {
      const success = await switchToScroll();
      if (!success) {
        setError('No se pudo cambiar de red. Por favor, cámbiala manualmente en tu wallet.');
      }
    } catch (err) {
      setError('Error al cambiar de red');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        connecting,
        error,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
