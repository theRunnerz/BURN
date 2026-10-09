/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.js';
import { AutopsySearch } from './components/AutopsySearch.js';
import { FreePreviewTeaser } from './components/FreePreviewTeaser.js';
import { UnlockedFullAutopsy } from './components/UnlockedFullAutopsy.js';
import { BurnPaymentModal } from './components/BurnPaymentModal.js';
import { PortfolioFuneral } from './components/PortfolioFuneral.js';
import { WalletHoroscope } from './components/WalletHoroscope.js';
import { RugDetector } from './components/RugDetector.js';
import { DegenLeaderboard } from './components/DegenLeaderboard.js';
import { DeathOracle } from './components/DeathOracle.js';
import { ArcadeCabinet } from './components/arcade/ArcadeCabinet.js';
import { CryptoChatRoom } from './components/chat/CryptoChatRoom.js';
import { ChainConfigModal } from './components/ChainConfigModal.js';
import { AutopsyReport, ChainConfig } from './types.js';
import { analyzeWallet, fetchChainConfig, verifyBurnTransaction } from './services/api.js';
import { connectTronWallet } from './services/tronWallet.js';
import { Activity, AlertTriangle, Skull } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'autopsy' | 'funeral' | 'horoscope' | 'rugs' | 'leaderboard' | 'oracle' | 'arcade' | 'chat' | 'config'>('autopsy');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState(false);

  const [chainConfig, setChainConfig] = useState<ChainConfig>({
    chainId: 'tron-mainnet',
    chainName: 'TRON Mainnet',
    currencySymbol: 'TRX',
    burnTokenSymbol: 'AUTOPSY',
    burnTokenName: 'Autopsy Meme Token',
    burnTokenContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    burnAddress: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    requiredBurnAmount: 10000,
    explorerBaseUrl: 'https://tronscan.org/#/transaction/',
    isTestnet: false,
  });
  const [availableChains, setAvailableChains] = useState<Array<{ id: string; name: string; active: boolean }>>([]);
  const [activeChain, setActiveChain] = useState('tron');

  const [currentReport, setCurrentReport] = useState<AutopsyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Reading public TRON ledger...');
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize chain config & detect TronLink on load
  useEffect(() => {
    fetchChainConfig()
      .then((data) => {
        setChainConfig(data.config);
        setActiveChain(data.activeChain);
        setAvailableChains(data.availableChains);
      })
      .catch((err) => console.warn('Config fetch notice:', err));

    // Check if TronLink is already connected
    if (typeof window !== 'undefined' && window.tronWeb && window.tronWeb.defaultAddress?.base58) {
      setWalletAddress(window.tronWeb.defaultAddress.base58);
      setIsTronLinkInstalled(true);
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setGlobalError(null);
    try {
      const res = await connectTronWallet();
      setIsTronLinkInstalled(res.isTronLinkInstalled);
      if (res.connected && res.address) {
        setWalletAddress(res.address);
      } else if (res.error) {
        setGlobalError(res.error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };

  const handleAnalyzeAddress = async (address: string) => {
    setIsLoading(true);
    setGlobalError(null);
    setCurrentReport(null);
    setActiveTab('autopsy');

    const steps = [
      'Scanning public TRON blockchain records...',
      'Counting necrotic meme bags and unliquidated tokens...',
      'Examining SunPump scar tissue & DEX transactions...',
      'Consulting Chief Forensic Pathologist with Gemini...',
      'Calculating Degen and Rug Survival indexes...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 1200);

    try {
      const res = await analyzeWallet(address);
      setCurrentReport(res.report);
      setChainConfig(res.activeChainConfig);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to examine wallet address.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleVerifyBurn = async (txHash: string, burnAmount = 0.25, burnTokenSymbol = 'TRX') => {
    if (!currentReport) return;
    try {
      const res = await verifyBurnTransaction(currentReport.id, txHash, walletAddress || currentReport.address, burnAmount, burnTokenSymbol);
      if (res.success && res.report) {
        setCurrentReport(res.report);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to verify transaction on ledger.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 scanline-bg">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isConnecting={isConnecting}
        chainName={chainConfig.chainName}
        isTronLinkInstalled={isTronLinkInstalled}
      />

      {/* Global Alert */}
      {globalError && (
        <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
          <div className="p-3 bg-rose-950/70 border border-rose-900 rounded-lg flex items-center justify-between text-xs text-rose-300 font-mono-data">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button onClick={() => setGlobalError(null)} className="text-zinc-400 hover:text-white font-sans">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Tab 1: Autopsy */}
        {activeTab === 'autopsy' && (
          <div className="space-y-10">
            {/* Search and Address Ingestion */}
            <AutopsySearch
              onAnalyze={handleAnalyzeAddress}
              isLoading={isLoading}
              connectedWallet={walletAddress}
              onDisconnect={handleDisconnectWallet}
            />

            {/* Loading Inspection Animation */}
            {isLoading && (
              <div className="w-full max-w-xl mx-auto bg-zinc-900/90 border border-rose-900/40 rounded-xl p-8 text-center space-y-4 morgue-glow-red animate-pulse">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-950 border border-rose-600/60 flex items-center justify-center text-rose-500">
                  <Skull className="w-7 h-7 animate-bounce" />
                </div>
                <h3 className="font-heading font-black text-xl text-white tracking-wider uppercase">
                  Performing Surgical Autopsy
                </h3>
                <p className="text-xs font-mono-data text-rose-400">
                  {loadingStep}
                </p>
                <div className="w-48 mx-auto h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-rose-600 animate-indeterminate rounded-full" />
                </div>
              </div>
            )}

            {/* Report Display */}
            {!isLoading && currentReport && (
              <>
                {!currentReport.unlocked ? (
                  <FreePreviewTeaser
                    report={currentReport}
                    chainConfig={chainConfig}
                    onOpenBurnModal={() => setIsBurnModalOpen(true)}
                  />
                ) : (
                  <UnlockedFullAutopsy
                    report={currentReport}
                    chainConfig={chainConfig}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Portfolio Funeral */}
        {activeTab === 'funeral' && (
          <PortfolioFuneral
            currentAddress={currentReport?.address || walletAddress || undefined}
            chainBurnAddress={chainConfig.burnAddress}
          />
        )}

        {/* Tab 3: Horoscope */}
        {activeTab === 'horoscope' && (
          <WalletHoroscope
            currentAddress={currentReport?.address || walletAddress || undefined}
            degenScore={currentReport?.scores.degenScore || 85}
          />
        )}

        {/* Tab 4: Rug Detector */}
        {activeTab === 'rugs' && (
          <RugDetector
            walletData={currentReport?.walletData}
            onScanAddress={handleAnalyzeAddress}
          />
        )}

        {/* Tab 5: Degen Leaderboard */}
        {activeTab === 'leaderboard' && (
          <DegenLeaderboard onSelectAddress={handleAnalyzeAddress} />
        )}

        {/* Tab 6: Spooky Halloween Death Oracle */}
        {activeTab === 'oracle' && (
          <DeathOracle
            currentAddress={currentReport?.address || walletAddress || undefined}
            degenScore={currentReport?.scores.degenScore || 88}
          />
        )}

        {/* Tab 7: Retro Arcade (Tron Man & X1roid - 0.25 TRX) */}
        {activeTab === 'arcade' && (
          <ArcadeCabinet
            walletAddress={walletAddress}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {/* Tab 8: Degen Crypt & Morgue Chat */}
        {activeTab === 'chat' && (
          <CryptoChatRoom
            walletAddress={walletAddress}
            currentReport={currentReport}
            onSelectAddress={handleAnalyzeAddress}
            onOpenArcade={() => setActiveTab('arcade')}
          />
        )}

        {/* Tab 9: Chain & Burn Config */}
        {activeTab === 'config' && (
          <ChainConfigModal
            currentChain={activeChain}
            chainConfig={chainConfig}
            availableChains={availableChains}
            onConfigUpdated={(newCfg, chainId) => {
              setChainConfig(newCfg);
              setActiveChain(chainId);
            }}
          />
        )}
      </main>

      {/* Burn Payment Modal */}
      {currentReport && (
        <BurnPaymentModal
          isOpen={isBurnModalOpen}
          onClose={() => setIsBurnModalOpen(false)}
          autopsyId={currentReport.id}
          walletAddress={walletAddress || currentReport.address}
          chainConfig={chainConfig}
          onBurnVerified={handleVerifyBurn}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-xs text-zinc-400 font-mono-data">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-300 font-bold">TRON WALLET AUTOPSY</span>
            <span aria-hidden="true">·</span>
            <span>All burns verified on TRON public ledger</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400 flex-wrap justify-center sm:justify-end">
            <span>Read-only & Non-custodial</span>
            <span aria-hidden="true">·</span>
            <span>Target Burn: {chainConfig.burnAddress.slice(0, 6)}...{chainConfig.burnAddress.slice(-4)}</span>
            <span aria-hidden="true">·</span>
            <span>Arcade Revenue: TENXRk...HygP</span>
            <span aria-hidden="true">·</span>
            <span>Swappable for X1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
