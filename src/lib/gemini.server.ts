import { createGoogle } from '@ai-sdk/google';
import { GEMINI_PRIMARY, withGeminiAvailability } from './gemini-retry';
import { aiErrorStatus } from './analysis-errors';

// Official pricing checked 2026-11-14: stable Flash-Lite models support images and free tier.
// https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
// https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-flash-lite
export function createGeminiModel(model: string = GEMINI_PRIMARY) {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) throw new Error('IA não configurada. Configure a chave do Gemini.');
  return createGoogle({ apiKey })(model);
}

export async function runGemini<T>(label: string, call: (model: ReturnType<typeof createGeminiModel>) => Promise<T>): Promise<T> {
  return withGeminiAvailability(async model => {
    try { return await call(createGeminiModel(model)); }
    catch (error) {
      const e = error as {name?: string; message?: string; responseBody?: string};
      let type = e?.name;
      let message = e?.message ?? 'Erro sem mensagem';
      try { const body = JSON.parse(e?.responseBody ?? '{}'); type = body.error?.status ?? type; message = body.error?.message ?? message; } catch { /* No raw response logging. */ }
      const key = process.env['GEMINI_API_KEY'];
      console.error(`[${label}]`, {model, status: aiErrorStatus(error), type, message: (key ? message.replaceAll(key, '[credencial protegida]') : message).slice(0, 1200)});
      throw error;
    }
  });
}

export const geminiOptions = {
  google: { thinkingConfig: { thinkingLevel: 'low' as const } },
};