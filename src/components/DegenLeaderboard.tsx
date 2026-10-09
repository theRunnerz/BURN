import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Skull, ExternalLink, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../types.js';
import { fetchLeaderboard } from '../services/api.js';

interface DegenLeaderboardProps {
  onSelectAddress: (address: string) => void;
}

export const DegenLeaderboard: React.FC<DegenLeaderboardProps> = ({ onSelectAddress }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard();
      setEntries(data.leaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase text-yellow-400 bg-yellow-950/40 border border-yellow-900/60 px-3 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Terminal Degeneracy</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
          DEGEN <span className="text-yellow-400">LEADERBOARD</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          The most financially wounded and gloriously reckless wallets diagnosed on the TRON network.
        </p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-mono-data text-zinc-400 uppercase">
            Top Diagnosed Patients
          </span>
          <button
            onClick={loadLeaderboard}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono-data"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {entries.map((entry, index) => (
            <div
              key={entry.id || index}
              onClick={() => onSelectAddress(entry.address)}
              className="p-4 hover:bg-zinc-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono-data font-bold text-zinc-500 text-sm">
                  #{index + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-bold text-zinc-100">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </span>
                    {entry.unlocked && (
                      <span className="text-[10px] uppercase font-mono-data px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        Burned
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 italic line-clamp-1 mt-0.5 max-w-md">
                    "{entry.causeOfDeath}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-9 sm:ml-0">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-mono-data block">Degen Rating</span>
                  <span className="text-base font-heading font-black text-rose-500 font-mono-data">
                    {entry.degenScore}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
