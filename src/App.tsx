import React, { useState } from 'react';
import { Header } from './components/Header';
import { AutopsyCard } from './components/AutopsyCard';
import { DeadTokenList } from './components/DeadTokenList';
import { BurnCertificateModal } from './components/BurnCertificateModal';
import { HallOfTheDead } from './components/HallOfTheDead';
import { BurnLeaderboard } from './components/BurnLeaderboard';
import { MemorialCandles } from './components/MemorialCandles';
import { DeathOracle } from './components/DeathOracle';
import { ArcadeCabinet } from './components/arcade/ArcadeCabinet';
import { CemeteryChat } from './components/CemeteryChat';
import { FootballAlienPortal } from './components/FootballAlienPortal';
import { AutopsyReport, BurnCertificate } from './types';
import { fetchAutopsyReport } from './services/api';
import { Skull, AlertTriangle, ShieldAlert } from 'lucide-react';

export function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'autopsy' | 'burn' | 'hall' | 'leaderboard' | 'memorials' | 'oracle' | 'arcade' | 'chat' | 'football-alien'>('football-alien');
  const [autopsyReport, setAutopsyReport] = useState<AutopsyReport | null>(null);
  const [isLoadingAutopsy, setIsLoadingAutopsy] = useState<boolean>(false);
  const [autopsyError, setAutopsyError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [latestCertificate, setLatestCertificate] = useState<BurnCertificate | null>(null);
  const [ashesBalance, setAshesBalance] = useState<number>(1420);

  // Connect mock / real TronLink wallet
  const handleConnectWallet = async () => {
    if ((window as any).tronWeb && (window as any).tronWeb.defaultAddress) {
      const addr = (window as any).tronWeb.defaultAddress.base58;
      if (addr) {
        setWalletAddress(addr);
        setSearchAddress(addr);
        runAutopsy(addr);
        return;
      }
    }
    // Fallback demo address
    const demoAddr = 'TD3z7mNq8yP1vX0K4wL9uR5bS2aC8eJ1hG';
    setWalletAddress(demoAddr);
    setSearchAddress(demoAddr);
    runAutopsy(demoAddr);
  };

  const runAutopsy = async (addressToScan: string) => {
    if (!addressToScan.trim()) return;
    try {
      setIsLoadingAutopsy(true);
      setAutopsyError(null);
      const report = await fetchAutopsyReport(addressToScan.trim());
      setAutopsyReport(report);
    } catch (err: any) {
      setAutopsyError(err.message || 'Failed to complete autopsy');
    } finally {
      setIsLoadingAutopsy(false);
    }
  };

  const handleBurnSuccess = (certificate: BurnCertificate) => {
    setLatestCertificate(certificate);
    setAshesBalance(prev => prev + certificate.ashesReceived);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ashesBalance={ashesBalance}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 0: Football Alien Portal */}
        {activeTab === 'football-alien' && (
          <FootballAlienPortal
            walletAddress={walletAddress}
            onLaunchGame={() => setActiveTab('arcade')}
          />
        )}

        {/* Tab 1: Autopsy Scanner */}
        {activeTab === 'autopsy' && (
          <div className="space-y-8">
            {/* Search / Scan Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono">
                <Skull className="w-3.5 h-3.5 text-red-500" />
                <span>POST-MORTEM BLOCKCHAIN PATHOLOGY</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                TRON WALLET <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">AUTOPSY</span>
              </h1>
              <p className="text-zinc-400 font-mono text-sm sm:text-base">
                Paste any TRON address to detect dead SunPump tokens, calculate total dollar loss, and receive a diagnosis from the Chief Blockchain Mortician.
              </p>

              {/* Input Form */}
              <div className="pt-4 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runAutopsy(searchAddress);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Enter TRON wallet (e.g. TD3z... or TJ9X...)"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/80 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingAutopsy}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-950/40 disabled:opacity-50"
                  >
                    {isLoadingAutopsy ? 'Examining Corpse...' : 'Perform Autopsy'}
                  </button>
                </form>

                {/* Sample quick buttons */}
                <div className="flex items-center justify-center space-x-2 pt-3 text-xs font-mono text-zinc-500">
                  <span>Quick inspect:</span>
                  <button
                    onClick={() => {
                      const ex = 'TD3z7mNq8yP1vX0K4wL9uR5bS2aC8eJ1hG';
                      setSearchAddress(ex);
                      runAutopsy(ex);
                    }}
                    className="text-zinc-400 hover:text-red-400 underline decoration-dashed"
                  >
                    Degen Victim (4 rugs)
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      const ex = 'TJ9X4kL9yP2vX0K7wM3uR8bS1aC9eJ4hB';
                      setSearchAddress(ex);
                      runAutopsy(ex);
                    }}
                    className="text-zinc-400 hover:text-red-400 underline decoration-dashed"
                  >
                    SunPump Survivor (14 rugs)
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {autopsyError && (
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{autopsyError}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoadingAutopsy && (
              <div className="py-16 text-center space-y-4">
                <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-sm text-zinc-400">Consulting coroner records and scanning TRON memepools...</p>
              </div>
            )}

            {/* Autopsy Result Report */}
            {autopsyReport && !isLoadingAutopsy && (
              <div className="space-y-6">
                <AutopsyCard report={autopsyReport} />
                
                {/* Direct Action Link to Incinerate */}
                <div className="p-6 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-bold text-white text-base">Ready to cleanse this wallet?</h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      Send {autopsyReport.financialVitals.deadTokensCount} dead token contracts to the crematorium and mint proof-of-burn $ASHES.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('burn')}
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-950/50"
                  >
                    Open Crematorium →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incinerator & Token Burning */}
        {activeTab === 'burn' && (
          <div className="space-y-8">
            <DeadTokenList
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onBurnSuccess={handleBurnSuccess}
            />
          </div>
        )}

        {/* Tab 3: Arcade Cabinet */}
        {activeTab === 'arcade' && (
          <ArcadeCabinet
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
            defaultGame="football-alien"
          />
        )}

        {/* Tab 4: Cemetery Chat */}
        {activeTab === 'chat' && (
          <CemeteryChat
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {/* Tab 5: Hall of the Dead */}
        {activeTab === 'hall' && <HallOfTheDead />}

        {/* Tab 6: Burn Leaderboard */}
        {activeTab === 'leaderboard' && <BurnLeaderboard />}

        {/* Tab 7: Community Memorials */}
        {activeTab === 'memorials' && <MemorialCandles walletAddress={walletAddress} />}

        {/* Tab 8: Death Oracle */}
        {activeTab === 'oracle' && (
          <DeathOracle
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
          />
        )}
      </main>

      {/* Burn Certificate Modal */}
      {latestCertificate && (
        <BurnCertificateModal
          certificate={latestCertificate}
          onClose={() => setLatestCertificate(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 mt-16 font-mono text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-zinc-400">TRON Autopsy & Dead Token Furnace 💀🔥</p>
            <p className="text-[11px] text-zinc-600">
              Not financial advice. Meme tokens carry high risk. Memorialize your fallen bags and game in peace.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-red-400 font-semibold">TRON NETWORK</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">$FBA VERIFIED</span>
            <span>•</span>
            <span className="text-orange-400 font-semibold">$ASHES MINTING ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
