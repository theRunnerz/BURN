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
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 6;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

        // Inner frame
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

        // Header banner
        ctx.fillStyle = '#18181b';
        ctx.fillRect(30, 30, canvas.width - 60, 90);

        // Header Accent line
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(30, 118, canvas.width - 60, 4);

        // Header Title
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('☣ TRON WALLET AUTOPSY PROTOCOL', 60, 85);

        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.textAlign = 'right';
        ctx.fillText('OFFICIAL DEATH CERTIFICATE', canvas.width - 60, 85);
        ctx.textAlign = 'left';

        // Subject Address
        ctx.font = '16px "Courier New", monospace';
        ctx.fillStyle = '#e4e4e7';
        ctx.fillText(`SUBJECT: ${report.address}`, 60, 160);

        // Cause of Death Box
        ctx.fillStyle = '#18181b';
        ctx.fillRect(60, 185, canvas.width - 120, 120);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.strokeRect(60, 185, canvas.width - 120, 120);

        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#fb7185';
        ctx.fillText('PRIMARY CAUSE OF FINANCIAL EXPIRATION:', 80, 215);

        ctx.font = 'italic bold 24px Georgia, serif';
        ctx.fillStyle = '#ffffff';
        // Wrap text if needed
        const words = `"${report.causeOfDeath}"`.split(' ');
        let line = '';
        let y = 255;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > canvas.width - 160 && n > 0) {
            ctx.fillText(line, 80, y);
            line = words[n] + ' ';
            y += 30;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);

        // Scores Section - 4 Columns
        const boxWidth = 245;
        const startX = 60;
        const boxY = 330;
        const boxHeight = 110;
        const gap = (canvas.width - 120 - (boxWidth * 4)) / 3;

        const scores = [
          { label: 'DEGEN SCORE', val: report.scores.degenScore, color: '#f43f5e' },
          { label: 'DIAMOND HANDS', val: report.scores.diamondHandsScore, color: '#38bdf8' },
          { label: 'RUG SURVIVAL', val: report.scores.rugSurvivalScore, color: '#fb923c' },
          { label: 'FINANCIAL IQ', val: report.scores.financialIq, color: '#a855f7' },
        ];

        scores.forEach((s, i) => {
          const bx = startX + i * (boxWidth + gap);
          ctx.fillStyle = '#18181b';
          ctx.fillRect(bx, boxY, boxWidth, boxHeight);
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, boxY, boxWidth, boxHeight);

          ctx.font = 'bold 13px "Courier New", monospace';
          ctx.fillStyle = '#a1a1aa';
          ctx.fillText(s.label, bx + 15, boxY + 30);

          ctx.font = 'bold 44px "Courier New", monospace';
          ctx.fillStyle = s.color;
          ctx.fillText(`${s.val}`, bx + 15, boxY + 80);

          ctx.font = 'bold 16px "Courier New", monospace';
          ctx.fillStyle = '#71717a';
          ctx.fillText('/100', bx + 85, boxY + 80);
        });

        // Autopsy Epitaph quote
        ctx.fillStyle = '#18181b';
        ctx.fillRect(60, 460, canvas.width - 120, 95);
        ctx.strokeStyle = '#3f3f46';
        ctx.strokeRect(60, 460, canvas.width - 120, 95);

        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = '#e4e4e7';
        ctx.fillText('PATHOLOGIST EPITAPH & FINAL DIAGNOSIS:', 80, 490);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#cbd5e1';
        const epitaphPreview = report.epitaph ? report.epitaph.slice(0, 110) + '...' : 'Liquidity departed to the cosmos. Memory eternal.';
        ctx.fillText(epitaphPreview, 80, 525);

        // Footer Bar
        ctx.fillStyle = '#0e0e11';
        ctx.fillRect(30, 575, canvas.width - 60, 68);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(30, 575, canvas.width - 60, 1);

        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`BURN RECORD: ${burnAmountDisplay}`, 60, 615);

        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText('thefootballalien.store // ROAST MY WALLET', canvas.width - 70, 615);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ blob, dataUrl: canvas.toDataURL('image/png') });
          } else {
            resolve(null);
          }
        }, 'image/png');
      } catch (err) {
        console.error('Error generating card image:', err);
        resolve(null);
      }
    });
  };

  // 1. Download image
  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const generated = await generateCanvasBlob();
      if (!generated) return;
      const link = document.createElement('a');
      link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
      link.href = generated.dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Copy Image directly to Clipboard (for pasting into X/Discord/Telegram)
  const handleCopyImageToClipboard = async () => {
    setIsExporting(true);
    try {
      const generated = await generateCanvasBlob();
      if (!generated) return;

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'image/png': generated.blob,
          }),
        ]);
        setIsImageCopied(true);
        setTimeout(() => setIsImageCopied(false), 3000);
      } else {
        // Fallback: download if browser doesn't support clipboard image writing
        handleDownloadImage();
      }
    } catch (err) {
      console.warn('Clipboard write image failed, falling back to download:', err);
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Smart Share to X:
  // Automatically copies the forensic image to user's clipboard, triggers download backup,
  // and opens X with pre-populated roast text ready for `Cmd+V` (paste image).
  const handleSmartShareToX = async () => {
    setIsExporting(true);
    try {
      const tweetContent = getTweetText(tweetVibe);

      // Attempt to copy image to clipboard
      const generated = await generateCanvasBlob();
      if (generated) {
        if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new window.ClipboardItem({
                'image/png': generated.blob,
              }),
            ]);
            setIsImageCopied(true);
          } catch {
            // Ignore clipboard permission reject
          }
        }

        // Also trigger download so user has it immediately in Downloads bar
        const link = document.createElement('a');
        link.download = `tron-autopsy-${report.address.slice(0, 8)}.png`;
        link.href = generated.dataUrl;
        link.click();
      }

      // Show instruction helper modal
      setShowHelperModal(true);

      // Open Twitter Intent in new tab
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Share to X failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy plain tweet text
  const handleCopyText = async () => {
    const text = getTweetText(tweetVibe);
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Vibe Selector Tabs */}
      <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-mono-data text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Choose Share Roast Vibe:
        </span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setTweetVibe('roast')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
              tweetVibe === 'roast'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            🔥 Savage Roast
          </button>
          <button
            onClick={() => setTweetVibe('degen')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
              tweetVibe === 'degen'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            🦍 Degen Scores
          </button>
          <button
            onClick={() => setTweetVibe('arcade')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
              tweetVibe === 'arcade'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            🕹️ Arcade Cope
          </button>
        </div>
      </div>

      {/* Main Forensic Share Card View */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-zinc-950 border-2 border-red-700 p-6 sm:p-8 shadow-2xl morgue-glow-red font-sans"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-700" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-400">
              <Skull className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono-data text-xs tracking-widest uppercase font-bold">
                  DEATH CERTIFICATE #TRON-666
                </span>
                <span className="bg-red-900/40 text-red-400 border border-red-800/60 text-[10px] px-1.5 py-0.5 rounded uppercase font-mono-data">
                  VERIFIED
                </span>
              </div>
              <h2 className="text-2xl font-black font-heading tracking-wide text-white uppercase">
                FORENSIC AUTOPSY
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono-data text-xs text-zinc-400">
            <div>SUBJECT: <span className="text-zinc-200 font-bold">{truncatedAddress}</span></div>
            <div className="text-[11px] text-zinc-400">
              BURN RECORD: <span className="text-red-400 font-bold">{burnAmountDisplay}</span>
            </div>
          </div>
        </div>

        {/* Cause of Death Highlight */}
        <div className="my-6 p-4 rounded-xl bg-red-950/20 border border-red-800/40">
          <span className="text-[11px] font-mono-data text-red-400 uppercase tracking-widest block mb-1">
            PRIMARY CAUSE OF FINANCIAL MORTALITY
          </span>
          <p className="text-lg sm:text-xl font-serif italic text-white font-semibold">
            "{report.causeOfDeath}"
          </p>
        </div>

        {/* Forensic Scores Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 font-mono-data">
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase block">DEGEN RATING</span>
            <span className="text-2xl font-black text-rose-400">{report.scores.degenScore}</span>
            <span className="text-[10px] text-zinc-400">/100</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase block">DIAMOND HANDS</span>
            <span className="text-2xl font-black text-sky-400">{report.scores.diamondHandsScore}</span>
            <span className="text-[10px] text-zinc-400">/100</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase block">RUG SURVIVAL</span>
            <span className="text-2xl font-black text-amber-400">{report.scores.rugSurvivalScore}</span>
            <span className="text-[10px] text-zinc-400">/100</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase block">FINANCIAL IQ</span>
            <span className="text-2xl font-black text-purple-400">{report.scores.financialIq}</span>
            <span className="text-[10px] text-zinc-400">/100</span>
          </div>
        </div>

        {/* Pathologist Epitaph */}
        <div className="border-t border-zinc-800/80 pt-4 text-xs font-mono-data text-zinc-300">
          <span className="text-zinc-400 uppercase tracking-wider block mb-1">
            PATHOLOGIST'S FINAL DIAGNOSIS:
          </span>
          <p className="line-clamp-2 italic text-zinc-300">
            {report.epitaph || 'Wallet suffered irreversible liquidation. May liquidity rest in peace.'}
          </p>
        </div>

        {/* Card Footer Branding */}
        <div className="mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono-data text-zinc-400">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>thefootballalien.store</span>
          </div>
          <span>OFFICIAL COMMUNITY AUTOPSY</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Viral X Button */}
        <button
          onClick={handleSmartShareToX}
          disabled={isExporting}
          className="col-span-1 sm:col-span-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 active:scale-95 transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share to 𝕏 (with Image)</span>
        </button>

        {/* Copy Image directly to clipboard */}
        <button
          onClick={handleCopyImageToClipboard}
          disabled={isExporting}
          className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-mono-data text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {isImageCopied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Image Copied!</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Copy Image (Cmd+C)</span>
            </>
          )}
        </button>

        {/* Download High Res Image */}
        <button
          onClick={handleDownloadImage}
          disabled={isExporting}
          className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-mono-data text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>{isExporting ? 'Generating...' : 'Download Card'}</span>
        </button>
      </div>

      {/* Copy Text Option */}
      <div className="flex items-center justify-between px-2 text-xs font-mono-data text-zinc-400">
        <span>Need just the text?</span>
        <button
          onClick={handleCopyText}
          className="text-rose-400 hover:text-rose-300 underline flex items-center gap-1"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{isCopied ? 'Text copied!' : 'Copy roast text only'}</span>
        </button>
      </div>

      {/* Helper Modal Popup When User clicks "Share to X" */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in font-mono-data text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase">
                <Skull className="w-4 h-4" />
                <span>Ready to Share on 𝕏</span>
              </div>
              <button
                onClick={() => setShowHelperModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>
                  <strong>Image Copied & Downloaded!</strong> Your forensic autopsy certificate is ready.
                </span>
              </div>

              <p className="text-zinc-400">
                In your new <strong>𝕏 tab</strong>:
              </p>

              <ol className="list-decimal list-inside space-y-2 pl-1 text-zinc-200">
                <li>
                  Your roast tweet text has already been typed for you.
                </li>
                <li>
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-amber-300">Cmd + V</kbd> (or <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-amber-300">Ctrl + V</kbd>) inside the tweet box to paste the image card!
                </li>
                <li>
                  <em>(Or click the image icon in 𝕏 and select the image downloaded to your Downloads folder).</em>
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowHelperModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Got it, let's post!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};