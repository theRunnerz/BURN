import React, { useRef, useState } from 'react';
import { Download, Share2, Copy, Check, Sparkles, Skull, Flame } from 'lucide-react';
import { AutopsyReport, ChainConfig } from '../types.js';

interface AutopsyShareCardProps {
  report: AutopsyReport;
  chainConfig: ChainConfig;
}

export const AutopsyShareCard: React.FC<AutopsyShareCardProps> = ({
  report,
  chainConfig,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const truncatedAddress = `${report.address.slice(0, 6)}...${report.address.slice(-6)}`;
  const burnAmountDisplay = report.burnAmount
    ? `${report.burnAmount} ${report.burnTokenSymbol || 'TRX'}`
    : '0.25 TRX (1 QUARTER)';

  // Generate downloadable high-resolution PNG via HTML5 Canvas
  const handleDownloadImage = () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High-res canvas 1200x675 (16:9 viral card)
      canvas.width = 1200;
      canvas.height = 675;

      // 1. Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border with crimson biohazard styling
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Subtle inner frame
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // Top corner brackets
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(40, 70); ctx.lineTo(40, 40); ctx.lineTo(70, 40);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 70, 40); ctx.lineTo(canvas.width - 40, 40); ctx.lineTo(canvas.width - 40, 70);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(40, canvas.height - 70); ctx.lineTo(40, canvas.height - 40); ctx.lineTo(70, canvas.height - 40);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 70, canvas.height - 40); ctx.lineTo(canvas.width - 40, canvas.height - 40); ctx.lineTo(canvas.width - 40, canvas.height - 70);
      ctx.stroke();

      // Header Tag
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('FORENSIC CORONER RECORD // BIOHAZARD PROTOCOL 09', 70, 80);

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px sans-serif';
      ctx.fillText('TRON WALLET AUTOPSY', 70, 140);

      // Wallet Address pill
      ctx.fillStyle = '#18181b';
      ctx.fillRect(70, 165, 420, 45);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(70, 165, 420, 45);

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '22px monospace';
      ctx.fillText(`PATIENT: ${report.address.slice(0, 10)}...${report.address.slice(-8)}`, 90, 196);

      // Scores Grid (Left Column)
      const scoresStartY = 270;
      const metrics = [
        { label: '🦍 DEGEN SCORE', val: `${report.scores.degenScore}/100`, color: '#ef4444' },
        { label: '💎 DIAMOND HANDS', val: `${report.scores.diamondHandsScore}/100`, color: '#22d3ee' },
        { label: '🧠 FINANCIAL IQ', val: `${report.scores.financialIq}/100`, color: '#f59e0b' },
        { label: '☠️ RUG SURVIVAL', val: `${report.scores.rugSurvivalScore}/100`, color: '#c084fc' },
      ];

      metrics.forEach((m, idx) => {
        const y = scoresStartY + idx * 65;
        ctx.fillStyle = '#27272a';
        ctx.fillRect(70, y - 35, 440, 50);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(m.label, 90, y);

        ctx.fillStyle = m.color;
        ctx.font = 'bold 26px monospace';
        ctx.fillText(m.val, 400, y);
      });

      // Right Column: Cause of Death banner
      ctx.fillStyle = '#18181b';
      ctx.fillRect(550, 165, 580, 360);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(550, 165, 580, 360);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('CONFIRMED CAUSE OF DEATH:', 580, 210);

      // Wrapped Cause of Death Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 28px sans-serif';
      const words = `"${report.causeOfDeath}"`.split(' ');
      let line = '';
      let lineY = 260;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metricsW = ctx.measureText(testLine);
        if (metricsW.width > 520 && n > 0) {
          ctx.fillText(line, 580, lineY);
          line = words[n] + ' ';
          lineY += 40;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 580, lineY);

      // Doctor Quote / Punchline
      ctx.fillStyle = '#71717a';
      ctx.font = 'italic 20px sans-serif';
      ctx.fillText(report.toxicQuote, 580, lineY + 50);

      // DECEASED Stamp
      ctx.save();
      ctx.translate(980, 440);
      ctx.rotate(-0.15);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(-100, -25, 200, 50);
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFIED REKT', 0, 10);
      ctx.restore();

      // Bottom bar: Burned Token info & Website CTA
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`🔥 BURNED: ${burnAmountDisplay}`, 70, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('tronwalletautopsy.com // ROAST MY WALLET', canvas.width - 70, 600);

      // Trigger download
      const link = document.createElement('a');
      link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Twitter / X share intent
  const handleShareOnX = () => {
    const tweetText = `My TRON wallet just received its official autopsy: 💀\n\n` +
      `Cause of Death: "${report.causeOfDeath}"\n` +
      `🦍 Degen Score: ${report.scores.degenScore}/100\n` +
      `🧠 Financial IQ: ${report.scores.financialIq}/100\n` +
      `🔥 Burned ${burnAmountDisplay} to diagnose\n\n` +
      `Roast your wallet at tronwalletautopsy.com #TRON #TRX $AUTOPSY`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            Official Autopsy Share Card
          </h3>
          <p className="text-xs text-zinc-400">
            Export as high-res viral image or post directly to X to challenge friends.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>{isExporting ? 'Generating PNG...' : 'Download Image'}</span>
          </button>

          <button
            onClick={handleShareOnX}
            className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/60"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on X</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            title="Copy link"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* The Visual Share Card (Pixel-Perfect Forensic Morgue Design) */}
      <div
        ref={cardRef}
        className="w-full max-w-2xl mx-auto bg-zinc-950 border-2 border-rose-600/80 rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-2xl font-mono-data morgue-glow-red"
      >
        {/* Top Coroner Header */}
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
            <Skull className="w-4 h-4" />
            <span>🪦 WALLET AUTOPSY</span>
          </div>
          <span className="text-[11px] text-zinc-400">TRON FORENSIC UNIT</span>
        </div>

        {/* Truncated Address */}
        <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded inline-block text-xs font-mono-data text-zinc-300 mb-5">
          WALLET: <span className="text-rose-400 font-bold">{truncatedAddress}</span>
        </div>

        {/* Diagnostic Scores Box */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-5">
          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">🦍 DEGEN SCORE</span>
            <span className="text-rose-400 font-bold text-sm">{report.scores.degenScore}</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">💎 DIAMOND HANDS</span>
            <span className="text-cyan-400 font-bold text-sm">{report.scores.diamondHandsScore}</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">🧠 FINANCIAL IQ</span>
            <span className="text-amber-400 font-bold text-sm">{report.scores.financialIq}</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">☠️ RUG SURVIVAL</span>
            <span className="text-purple-400 font-bold text-sm">{report.scores.rugSurvivalScore}</span>
          </div>
        </div>

        {/* Cause of Death in Card */}
        <div className="border-t border-b border-rose-900/40 py-3.5 my-4">
          <span className="text-[11px] uppercase tracking-wider text-rose-500 font-bold block mb-1">
            CAUSE OF DEATH:
          </span>
          <p className="text-base sm:text-lg font-heading font-bold text-white italic">
            "{report.causeOfDeath}"
          </p>
        </div>

        {/* Proof of Burn & Call to Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-2">
          <span className="text-rose-400 font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            BURNED: {burnAmountDisplay}
          </span>
          <span className="text-zinc-300 font-sans font-semibold text-xs">
            tronwalletautopsy.com
          </span>
        </div>

        {/* Coroner Stamp Overlay */}
        <div className="absolute right-6 bottom-14 hidden sm:block">
          <div className="coroner-stamp text-[10px] opacity-80">
            AUTOPSY CONFIRMED
          </div>
        </div>
      </div>
    </div>
  );
};
