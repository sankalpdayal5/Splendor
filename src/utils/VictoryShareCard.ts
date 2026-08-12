/**
 * HTML5 Canvas Renaissance Victory Card Generator
 * Creates a 1200x630 luxury victory card image to brag on WhatsApp / Social Media.
 */

export interface VictoryCardData {
  winnerName: string;
  prestigePoints: number;
  totalTurns: number;
  gemsOwned: { emerald: number; diamond: number; sapphire: number; ruby: number; onyx: number };
  cardsCount: number;
  noblesCount: number;
}

export function generateVictoryCardDataUrl(data: VictoryCardData): string {
  const fallbackPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  if (typeof document === 'undefined') return fallbackPng;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return fallbackPng;

  try {
    // Background Gradient
    const bgGrad = ctx.createRadialGradient(600, 315, 100, 600, 315, 650);
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.6, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 630);

    // Outer Gold Border
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 1160, 590);

    // Inner Subtle Gold Line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 1136, 566);

    // Corner Ornaments
    ctx.fillStyle = '#F59E0B';
    ctx.font = '28px serif';
    ctx.fillText('👑', 45, 65);
    ctx.fillText('👑', 1120, 65);
    ctx.fillText('👑', 45, 580);
    ctx.fillText('👑', 1120, 580);

    // Header Title
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPLENDOR DIGITAL BOARD GAME', 600, 90);

    // Victory Banner Text
    ctx.fillStyle = '#F59E0B';
    ctx.font = '900 64px sans-serif';
    ctx.fillText('VICTORY BANNER', 600, 170);

    // Winner Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(data.winnerName, 600, 250);

    // Score Badge Circle
    ctx.beginPath();
    ctx.arc(600, 360, 75, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = '900 68px sans-serif';
    ctx.fillText(`${data.prestigePoints}`, 600, 375);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('PRESTIGE POINTS', 600, 415);

    // Match Summary Footnote
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '26px sans-serif';
    ctx.fillText(`🏆 Victory in ${data.totalTurns} Turns | 🎴 ${data.cardsCount} Cards Purchased | 📜 ${data.noblesCount} Nobles Claimed`, 600, 510);

    // Footer Tagline
    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('Play Splendor Online & Offline at splendor.game', 600, 570);

    return canvas.toDataURL('image/png');
  } catch (e) {
    return fallbackPng;
  }
}
