import React, { useEffect, useRef, useState } from 'react';
import { fetchChatMessages, sendChatMessage } from '../../services/api.js';
import { AutopsyReport, ChatMessage } from '../../types.js';
import { MessageSquare, Send, Sparkles, Skull, Flame, Trophy, Coins, User, RefreshCw, AlertCircle } from 'lucide-react';

interface CryptoChatRoomProps {
  walletAddress: string | null;
  currentReport: AutopsyReport | null;
  onSelectAddress?: (address: string) => void;
  onOpenArcade: () => void;
}

const QUICK_REACTIONS = [
  '💀 F in the chat',
  '🔥 He bought the dip',
  '🩸 Certified Rekt',
  '📉 Liquidity evaporated',
  '🚀 Wen utility?',
  '🪙 Dropped a 0.25 TRX quarter',
];

export const CryptoChatRoom: React.FC<CryptoChatRoomProps> = ({
  walletAddress,
  currentReport,
  onSelectAddress,
  onOpenArcade,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState(
    walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Degen'
  );
  const [selectedBadge, setSelectedBadge] = useState<'DEGEN' | 'WHALE' | 'CHAMPION' | 'CORONER'>('DEGEN');
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'autopsies' | 'arcade'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sender name when wallet changes
  useEffect(() => {
    if (walletAddress) {
      setSenderName(`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`);
    }
  }, [walletAddress]);

  // Load and poll chat messages
  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const res = await fetchChatMessages();
        if (isMounted && res.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        // silent polling catch
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setIsSending(true);
    try {
      const res = await sendChatMessage({
        text,
        sender: senderName,
        walletAddress: walletAddress || undefined,
        badge: selectedBadge,
      });

      if (res.messages) {
        setMessages(res.messages);
      }
      if (!textToSend) setInputText('');
    } catch (err: any) {
      console.error('Send message failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleShareAutopsyToChat = async () => {
    if (!currentReport) return;
    setIsSending(true);

    try {
      const shareText = `🪦 Autopsy for ${currentReport.address.slice(0, 4)}...${currentReport.address.slice(-4)}: Degen Score ${currentReport.scores.degenScore}/100. Cause of Death: "${currentReport.causeOfDeath}"`;

      const res = await sendChatMessage({
        text: shareText,
        sender: senderName,
        walletAddress: currentReport.address,
        badge: 'CORONER',
        autopsyCard: {
          degenScore: currentReport.scores.degenScore,
          causeOfDeath: currentReport.causeOfDeath,
        },
      });

      if (res.messages) {
        setMessages(res.messages);
      }
    } catch (err: any) {
      console.error('Share autopsy failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'autopsies') return !!m.autopsyCard;
    if (filter === 'arcade') return m.sender.includes('Arcade') || m.text.includes('TRX');
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-zinc-950/80 border border-rose-900/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4 morgue-glow-red">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-[11px] font-mono-data">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE CRYPT & MORGUE CHAT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide text-white uppercase">
            DEGEN AUTOPSY LOUNGE
          </h2>
          <p className="text-xs text-zinc-400 font-mono-data">
            Roast necrotic bags, share autopsy reports, and talk arcade high scores with fellow survivors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentReport && (
            <button
              onClick={handleShareAutopsyToChat}
              disabled={isSending}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono-data text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/30 active:scale-95 transition-transform"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Share My Autopsy</span>
            </button>
          )}

          <button
            onClick={onOpenArcade}
            className="px-3.5 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-300 font-mono-data text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>Play Arcade (0.25 TRX)</span>
          </button>
        </div>
      </div>

      {/* Chat Room Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
        {/* Chat Subheader & Filters */}
        <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono-data">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded transition-all ${
                filter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Chatter ({messages.length})
            </button>
            <button
              onClick={() => setFilter('autopsies')}
              className={`px-3 py-1 rounded transition-all ${
                filter === 'autopsies' ? 'bg-zinc-800 text-rose-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🪦 Shared Autopsies
            </button>
            <button
              onClick={() => setFilter('arcade')}
              className={`px-3 py-1 rounded transition-all ${
                filter === 'arcade' ? 'bg-zinc-800 text-yellow-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🪙 Arcade Drops
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Community Online</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scanline-bg">
          {filteredMessages.map(msg => {
            const isSystem = msg.sender.includes('Arcade') || msg.sender.includes('Keeper') || msg.sender.includes('Announcer');
            const isOwn = walletAddress && msg.walletAddress?.toLowerCase() === walletAddress.toLowerCase();

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isSystem
                    ? 'items-center my-2'
                    : isOwn
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                {isSystem ? (
                  <div className="py-1 px-3 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] font-mono-data text-amber-300 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {/* Header info */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-data text-zinc-400 px-1">
                      <span className="font-bold text-zinc-200">{msg.sender}</span>
                      {msg.badge && (
                        <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold ${
                          msg.badge === 'CORONER' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          msg.badge === 'CHAMPION' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          msg.badge === 'WHALE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {msg.badge}
                        </span>
                      )}
                      <span>·</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Bubble */}
                    <div className={`p-3 rounded-xl text-xs font-mono-data leading-relaxed break-words shadow-md ${
                      isOwn
                        ? 'bg-rose-950/80 border border-rose-800 text-rose-100 rounded-tr-none'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>

                      {/* Embedded Autopsy Card */}
                      {msg.autopsyCard && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-black/70 border border-rose-900/60 space-y-1.5 text-left">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-rose-400 font-bold uppercase flex items-center gap-1">
                              <Skull className="w-3 h-3" />
                              Autopsy Diagnosis
                            </span>
                            <span className="text-yellow-400 font-bold">
                              Degen: {msg.autopsyCard.degenScore}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 italic">
                            "{msg.autopsyCard.causeOfDeath}"
                          </p>
                          {msg.walletAddress && onSelectAddress && (
                            <button
                              onClick={() => onSelectAddress(msg.walletAddress!)}
                              className="text-[10px] text-cyan-400 hover:underline block pt-1"
                            >
                              Inspect Wallet Forensic Records →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        <div className="px-3 py-2 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono-data">
          <span className="text-zinc-500 text-[10px] uppercase shrink-0">Quick React:</span>
          {QUICK_REACTIONS.map((qr, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qr)}
              disabled={isSending}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 shrink-0 border border-zinc-700/60 active:scale-95 transition-transform"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-2">
          {/* Sender Customizer */}
          <div className="flex items-center gap-2 text-xs font-mono-data">
            <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
              <User className="w-3.5 h-3.5" />
              <span>Handle:</span>
            </div>
            <input
              type="text"
              maxLength={18}
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-white max-w-[120px] focus:outline-none focus:border-zinc-700"
            />

            <span className="text-zinc-500">|</span>

            <span className="text-zinc-400 text-[11px]">Badge:</span>
            <select
              value={selectedBadge}
              onChange={e => setSelectedBadge(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="DEGEN">DEGEN</option>
              <option value="WHALE">WHALE</option>
              <option value="CHAMPION">CHAMPION</option>
              <option value="CORONER">CORONER</option>
            </select>
          </div>

          {/* Text Input & Submit */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              maxLength={280}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Post a message to the Degen Crypt..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono-data text-white placeholder-zinc-500 focus:outline-none focus:border-rose-700 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
