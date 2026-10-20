import React, { useRef, useState } from 'react';
import { Download, Share2, Copy, Check, Sparkles, Skull, Flame, Image as ImageIcon, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AutopsyReport, ChainConfig } from '../types.js';

interface AutopsyShareCardProps {
  report: AutopsyReport;
  chainConfig: ChainConfig;
}

export const AutopsyShareCard: React.FC<AutopsyShareCardProps> = ({
  report,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [tweetVibe, setTweetVibe] = useState<'roast' | 'degen' | 'arcade'>('roast');

  const truncatedAddress = `${report.address.slice(0, 6)}...${report.address.slice(-6)}`;
  const burnAmountDisplay = report.burnAmount
    ? `${report.burnAmount} ${report.burnTokenSymbol || 'TRX'}`
    : '0.25 TRX (1 QUARTER)';

  // Build the tweet texts based on chosen vibe
  const getTweetText = (vibe: 'roast' | 'degen' | 'arcade') => {
    switch (vibe) {
      case 'degen':
        return `Official TRON Forensic Autopsy Report: 💀\n\n` +
          `🦍 Degen Score: ${report.scores.degenScore}/100\n` +
          `💎 Diamond Hands: ${report.scores.diamondHandsScore}/100\n` +
          `☠️ Rug Survival: ${report.scores.rugSurvivalScore}/100\n` +
          `Cause of Death: "${report.causeOfDeath}"\n\n` +
          `Diagnose your bags at thefootballalien.store #TRON #TRX #TheFootballAlien`;
      case 'arcade':
        return `My TRON wallet just got incinerated at the morgue: 💀\n` +
          `Cause of Death: "${report.causeOfDeath}"\n\n` +
          `Dropping 0.25 TRX quarters into the retro arcade (Tron Man & X1roid) to cope.\n\n` +
          `Roast your bags and play at thefootballalien.store #TRON #TRX #RetroArcade`;
      case 'roast':
      default:
        return `My TRON wallet just received its official autopsy: 💀\n\n` +
          `Cause of Death: "${report.causeOfDeath}"\n` +
          `🦍 Degen Score: ${report.scores.degenScore}/100\n` +
          `🧠 Financial IQ: ${report.scores.financialIq}/100\n` +
          `🔥 Burned ${burnAmountDisplay} to diagnose\n\n` +
          `Roast your wallet or play 0.25 TRX games at thefootballalien.store #TRON #TRX #TheFootballAlien`;
    }
  };

  // Helper to generate the high-res Canvas Blob
  const generateCanvasBlob = (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

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
        ctx.fillText('thefootballalien.store // ROAST MY WALLET', canvas.width - 70, 600);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ blob, dataUrl });
        }, 'image/png');
      } catch (err) {
        console.error('Failed to generate card canvas', err);
        resolve(null);
      }
    });
  };

  // Direct PNG download
  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const result = await generateCanvasBlob();
      if (!result) return;
      const link = document.createElement('a');
      link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
      link.href = result.dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  // Direct clipboard copy of the image binary
  const handleCopyImageToClipboard = async () => {
    setIsExporting(true);
    try {
      const result = await generateCanvasBlob();
      if (!result) return;

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': result.blob });
        await navigator.clipboard.write([item]);
        setIsImageCopied(true);
        setTimeout(() => setIsImageCopied(false), 2500);
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
        link.href = result.dataUrl;
        link.click();
      }
    } catch (err) {
      console.warn('Image clipboard write failed, downloading instead:', err);
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  // Smart Share to X with Photo
  const handleShareOnX = async () => {
    setIsExporting(true);
    const tweetText = getTweetText(tweetVibe);

    try {
      const result = await generateCanvasBlob();

      // Check if native mobile Web Share API with files is supported
      if (result && navigator.canShare) {
        const file = new File(
          [result.blob],
          `tron-autopsy-${report.address.slice(0, 6)}.png`,
          { type: 'image/png' }
        );

        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'TRON Wallet Autopsy',
              text: tweetText,
            });
            setIsExporting(false);
            return;
          } catch (shareErr: any) {
            // If user closed or aborted the share sheet, exit gracefully
            if (shareErr.name === 'AbortError') {
              setIsExporting(false);
              return;
            }
            console.warn('Web Share failed, proceeding with desktop workflow', shareErr);
          }
        }
      }

      // Desktop / Web intent path:
      // 1. Copy image directly to clipboard so user can instantly Ctrl+V / Cmd+V
      if (result && navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': result.blob });
          await navigator.clipboard.write([item]);
          setIsImageCopied(true);
          setTimeout(() => setIsImageCopied(false), 3000);
        } catch (e) {
          console.warn('Clipboard write failed:', e);
        }
      }

      // 2. Open Twitter / X intent with viral prefilled tweet
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      // 3. Show our helpful modal toast showing them how to paste the photo
      setShowHelperModal(true);

      // 4. Also trigger background download as a safety backup
      if (result) {
        const link = document.createElement('a');
        link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
        link.href = result.dataUrl;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    const url = 'https://thefootballalien.store';
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            Official Autopsy Share Card
          </h3>
          <p className="text-xs text-zinc-400">
            Share directly to 𝕏 with photo attached, copy the image, or download in high resolution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Smart Share to X with Image */}
          <button
            onClick={handleShareOnX}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-heading font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/60 disabled:opacity-50 active:scale-95"
            title="Share to X with photo attached"
          >
            <Share2 className="w-4 h-4" />
            <span>{isExporting ? 'Preparing Card...' : 'Share to 𝕏 (with Photo)'}</span>
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyImageToClipboard}
            disabled={isExporting}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Copy image to clipboard to paste directly (Ctrl+V / Cmd+V)"
          >
            {isImageCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Image Copied!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download high-res PNG file"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Download</span>
          </button>

          {/* Copy Site Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            title="Copy website link"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tweet Vibe Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-xs font-mono-data">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <span>Post Style:</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTweetVibe('roast')}
            className={`px-2.5 py-1 rounded transition-colors ${
              tweetVibe === 'roast'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            💀 Brutal Roast
          </button>
          <button
            onClick={() => setTweetVibe('degen')}
            className={`px-2.5 py-1 rounded transition-colors ${
              tweetVibe === 'degen'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🦍 Degen Flex
          </button>
          <button
            onClick={() => setTweetVibe('arcade')}
            className={`px-2.5 py-1 rounded transition-colors ${
              tweetVibe === 'arcade'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🕹️ Arcade Challenge
          </button>
        </div>
      </div>

      {/* Helper Modal / Toast for Desktop Paste */}
      {showHelperModal && (
        <div className="p-4 bg-gradient-to-r from-rose-950/80 via-zinc-900 to-amber-950/80 border-2 border-rose-500/70 rounded-xl space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-400 font-heading font-black text-sm uppercase">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Card Image Copied to Clipboard & 𝕏 Composer Opened!</span>
            </div>
            <button
              onClick={() => setShowHelperModal(false)}
              className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-800 rounded cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="text-xs text-zinc-300 space-y-1.5 font-mono-data">
            <p className="flex items-center gap-1.5 text-zinc-200">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>We opened your 𝕏 (Twitter) tab with the pre-written viral post.</span>
            </p>
            <p className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span>2.</span>
              <span>Simply press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-white">Ctrl + V</kbd> (or <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-white">⌘ + V</kbd>) in the 𝕏 composer to attach the photo!</span>
            </p>
            <p className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <span>3.</span>
              <span>We also saved a backup PNG to your downloads folder just in case.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyImageToClipboard}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-medium flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-rose-400" />
              <span>Re-copy Image</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download PNG Again</span>
            </button>
          </div>
        </div>
      )}

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
          <span className="text-zinc-300 font-sans font-semibold text-xs flex items-center gap-1">
            <span>thefootballalien.store</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
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
