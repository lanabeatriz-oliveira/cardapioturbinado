export type DiagnosticState = {status: 'ok' | 'blocked' | 'error'; message: string};
export function aiFailure(status: number | undefined, message?: string): DiagnosticState {
  if (status === 503) return {status: 'error', message: 'A IA está sobrecarregada agora. Tente de novo em 1 minuto.'};
  if (status === 402) return {status: 'blocked', message: message || 'Os créditos de IA acabaram. Confira a cota no Google AI Studio.'};
  if (status === 403) return {status: 'blocked', message: message || 'IA bloqueada. Confira as permissões da chave no Google AI Studio.'};
  if (status === 401) return {status: 'error', message: 'A configuração de acesso à IA precisa ser corrigida.'};
  if (status === 429) return {status: 'error', message: 'Muitas solicitações à IA. Aguarde antes de verificar novamente.'};
  return {status: 'error', message: 'Não foi possível verificar a IA. Nenhuma análise foi iniciada.'};
}