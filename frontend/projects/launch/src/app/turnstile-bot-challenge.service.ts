import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BotChallengeService, type ProtectedAction } from '@sweet-hand/api';

interface TurnstileApi {
  render(target: HTMLElement, options: Record<string, unknown>): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window { turnstile?: TurnstileApi; }
}

@Injectable()
export class TurnstileBotChallengeService extends BotChallengeService {
  private readonly document = inject(DOCUMENT);
  private loading?: Promise<TurnstileApi>;

  async token(action: ProtectedAction): Promise<string> {
    const target = this.document.getElementById('turnstile-challenge');
    if (!target) throw new Error('Turnstile challenge host is unavailable');
    const api = await this.load();
    return new Promise<string>((resolve, reject) => {
      let widgetId = '';
      const done = (callback: () => void) => {
        callback();
        if (widgetId) api.remove(widgetId);
      };
      widgetId = api.render(target, {
        sitekey: LAUNCH_TURNSTILE_SITE_KEY,
        action,
        theme: 'auto',
        callback: (value: string) => done(() => resolve(value)),
        'error-callback': () => done(() => reject(new Error('Turnstile could not complete'))),
        'expired-callback': () => done(() => reject(new Error('Turnstile token expired'))),
      });
    });
  }

  private load(): Promise<TurnstileApi> {
    if (this.document.defaultView?.turnstile) return Promise.resolve(this.document.defaultView.turnstile);
    if (this.loading) return this.loading;
    this.loading = new Promise<TurnstileApi>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => this.document.defaultView?.turnstile ? resolve(this.document.defaultView.turnstile) : reject(new Error('Turnstile did not load')));
      script.addEventListener('error', () => reject(new Error('Turnstile did not load')));
      this.document.head.append(script);
    });
    return this.loading;
  }
}
