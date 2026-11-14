import {aiErrorStatus} from './analysis-errors';

// The newest Flash is unavailable (503 / headers timeout); use the verified stable free model.
export const GEMINI_PRIMARY = 'gemini-3.5-flash-lite';
export const GEMINI_FALLBACK = 'gemini-3.1-flash-lite';

export async function withGeminiAvailability<T>(
  call: (model: string) => Promise<T>,
  wait: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await call(GEMINI_PRIMARY); }
    catch (error) {
      if (aiErrorStatus(error) !== 503) throw error;
      if (attempt < 2) await wait(1000 * (attempt + 1));
    }
  }
  return call(GEMINI_FALLBACK);
}