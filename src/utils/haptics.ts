/**
 * Utility wrapper for Web Haptics API (navigator.vibrate)
 * Provides physical haptic feedback on mobile touch devices.
 */

export const Haptics = {
  /**
   * Light 12ms vibration pulse for selecting/staging gems
   */
  gemPick: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        // Silently ignore if not supported or disabled
      }
    }
  },

  /**
   * Medium 35ms vibration pulse for card purchases & reservations
   */
  cardAction: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch (e) {
        // Silently ignore
      }
    }
  },

  /**
   * Double victory pulse pattern for noble visits and 15-point wins
   */
  victoryFanfare: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 25, 40, 60]);
      } catch (e) {
        // Silently ignore
      }
    }
  },

  /**
   * Error warning pulse for invalid actions
   */
  warning: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([50, 30, 50]);
      } catch (e) {
        // Silently ignore
      }
    }
  }
};
