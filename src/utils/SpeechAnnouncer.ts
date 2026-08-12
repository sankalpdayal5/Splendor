// Debounced ARIA Speech Announcer for screen reader accessibility (WCAG 2.1 AA)

class SpeechAnnouncer {
  private queue: string[] = [];
  private timer: any = null;

  public announcePolite(message: string, delay = 350) {
    this.queue.push(message);
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      const combinedMessage = this.queue.join('. ');
      this.queue = [];

      if (typeof document !== 'undefined') {
        const politeRegion = document.getElementById('aria-live-polite');
        if (politeRegion) {
          politeRegion.textContent = '';
          requestAnimationFrame(() => {
            politeRegion.textContent = combinedMessage;
          });
        }
      }
    }, delay);
  }

  public announceAssertive(message: string) {
    if (typeof document !== 'undefined') {
      const assertiveRegion = document.getElementById('aria-live-assertive');
      if (assertiveRegion) {
        assertiveRegion.textContent = '';
        requestAnimationFrame(() => {
          assertiveRegion.textContent = message;
        });
      }
    }
  }
}

export const speechAnnouncer = new SpeechAnnouncer();
