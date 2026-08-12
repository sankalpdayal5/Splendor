/**
 * Social Sharing & Room Invite Engine
 * Integrates Web Share API with WhatsApp / Telegram / Twitter / Clipboard fallbacks.
 */

export interface ShareDataPayload {
  title: string;
  text: string;
  url: string;
}

export function generateRoomInvitePayload(roomCode: string): ShareDataPayload {
  const cleanCode = roomCode.trim().toUpperCase();
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${cleanCode}`
    : `https://splendor.game?room=${cleanCode}`;

  return {
    title: '💎 Play Splendor Board Game!',
    text: `Join my online Splendor match! Room Code: *${cleanCode}*. Click link to join:`,
    url: joinUrl
  };
}

export async function shareRoomInvite(roomCode: string): Promise<{ success: boolean; method: 'web_share' | 'whatsapp' | 'clipboard' }> {
  const payload = generateRoomInvitePayload(roomCode);
  const fullMessage = `${payload.text} ${payload.url}`;

  // 1. Try Native Web Share API (Mobile Web, PWA, Capacitor)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(payload)) {
    try {
      await navigator.share(payload);
      return { success: true, method: 'web_share' };
    } catch (e) {
      // User cancelled share dialog or API failed -> fallback
    }
  }

  // 2. Direct WhatsApp Web / App Intent Fallback
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    const waUrl = `whatsapp://send?text=${encodeURIComponent(fullMessage)}`;
    window.location.href = waUrl;
    return { success: true, method: 'whatsapp' };
  }

  // 3. Desktop Clipboard Copy Fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(fullMessage);
      return { success: true, method: 'clipboard' };
    } catch (e) {
      // Ignore
    }
  }

  return { success: false, method: 'clipboard' };
}

export function shareToWhatsAppDirect(text: string): void {
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
}
