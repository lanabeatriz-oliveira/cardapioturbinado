import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {aiFailure} from './diagnostic-rules';
import {aiErrorStatus, isAIQuotaError} from './analysis-errors';

export const checkAccount = createServerFn({method: 'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data: allowed, error} = await context.supabase.rpc('is_lana_admin');
  return {allowed: allowed === true && !error, message: error ? 'Não consegui confirmar a permissão administrativa.' : allowed ? 'Conta autenticada e autorizada para acessar /admin.' : 'Esta conta não tem acesso à administração.'};
});

export const checkAI = createServerFn({method: 'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data: allowed, error} = await context.supabase.rpc('is_lana_admin');
  if (error || !allowed) throw new Error('Acesso exclusivo da Lana.');
  const key = process.env['GEMINI_API_KEY'];
  if (!key) return {status: 'error' as const, message: 'A IA ainda não está configurada.'};
  const {createGeminiModel, geminiOptions} = await import('./gemini.server');
  const {streamText} = await import('ai');
  let providerError: unknown;
  try {
    const result = streamText({model: createGeminiModel(), maxRetries: 0, providerOptions: geminiOptions, onError: ({error}) => {providerError = error;}, prompt: 'Responda apenas OK.'});
    const text = await result.text;
    if (!text.trim()) return {status: 'error' as const, message: 'A IA não retornou uma resposta. Verificação encerrada.'};
    return {status: 'ok' as const, message: 'O Gemini respondeu a esta verificação. Isso não garante cota para outras análises; confira seus limites no Google AI Studio.'};
  } catch (error) {
    const original = providerError ?? error;
    return aiFailure(isAIQuotaError(original) ? 402 : aiErrorStatus(original));
  }
});