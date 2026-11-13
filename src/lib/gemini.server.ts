import { createGoogle } from '@ai-sdk/google';

// Official model/pricing docs checked 2026-11-13: text + image inputs, free tier.
// https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
// https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash
export function createGeminiModel() {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) throw new Error('IA não configurada. Configure a chave do Gemini.');
  return createGoogle({ apiKey })('gemini-3.8-flash');
}

export const geminiOptions = {
  google: { thinkingConfig: { thinkingLevel: 'low' as const } },
};