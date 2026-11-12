import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {aiFailure} from './diagnostic-rules';

export const checkAccount = createServerFn({method: 'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data: allowed, error} = await context.supabase.rpc('is_lana_admin');
  return {allowed: allowed === true && !error, message: error ? 'Não consegui confirmar a permissão administrativa.' : allowed ? 'Conta autenticada e autorizada para acessar /admin.' : 'Esta conta não tem acesso à administração.'};
});

export const checkAI = createServerFn({method: 'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data: allowed, error} = await context.supabase.rpc('is_lana_admin');
  if (error || !allowed) throw new Error('Acesso exclusivo da Lana.');
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) return {status: 'error' as const, message: 'A IA ainda não está configurada.'};
  const {createResponsesCall} = await import('./diagnostic-responses.server');
  try {
    const {result} = createResponsesCall(new Request('https://cardapioturbinado.lovable.app/diagnostico'), {baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: key, model: 'openai/gpt-6-astra'}, [{role: 'user', content: 'Responda apenas OK.'}]);
    const text = await result.text;
    if (!text.trim()) return {status: 'error' as const, message: 'A IA não retornou uma resposta. Verificação encerrada.'};
    return {status: 'ok' as const, message: 'A IA respondeu e há créditos para esta verificação. O saldo exato não é informado; análises e comparações podem consumir mais.'};
  } catch (error) {
    const {APICallError} = await import('ai');
    if (APICallError.isInstance(error)) {
      let message: string | undefined;
      try { const body = JSON.parse(error.responseBody || '{}'); const candidate = body.message ?? body.error?.message; if (typeof candidate === 'string') message = candidate.replaceAll(key, '[credencial protegida]'); } catch { /* Do not expose raw responses. */ }
      return aiFailure(error.statusCode, message);
    }
    return aiFailure(undefined);
  }
});