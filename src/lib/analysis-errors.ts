export function aiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as { statusCode?: number; cause?: unknown };
  return e.statusCode ?? aiErrorStatus(e.cause);
}

export function aiErrorMessage(error: unknown, fallback: string): string {
  const status = aiErrorStatus(error);
  if (status === 503) return 'A IA está sobrecarregada agora. Tente de novo em 1 minuto.';
  if (isAIQuotaError(error)) return 'Os créditos de IA acabaram. Fale com o responsável pelo app.';
  if (status === 429) return 'Muitas análises agora. Tente de novo em instantes.';
  // The gateway's safe message distinguishes credits, policy and provider denials.
  if (status === 402 || status === 403) {
    const e = error as { responseBody?: string; cause?: unknown };
    try {
      const body = JSON.parse(e.responseBody ?? '{}');
      const message = body.message ?? body.error?.message;
      if (typeof message === 'string' && message) return message;
    } catch { /* No safe structured message was supplied. */ }
    if (e.cause) return aiErrorMessage(e.cause, fallback);
    return status === 402 ? 'Os créditos de IA acabaram. Fale com o responsável pelo app.' : 'O acesso à IA foi bloqueado. Fale com o responsável pelo app.';
  }
  return fallback;
}

// Gemini reports both temporary throttling and daily quota exhaustion as 429.
// Inspect structured quota violations without exposing the provider response.
export function isAIQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { responseBody?: string; cause?: unknown };
  try {
    const body = JSON.parse(e.responseBody ?? '{}');
    const details = body.error?.details;
    if (Array.isArray(details) && details.some((detail: { violations?: Array<{quotaId?: string}> }) =>
      detail.violations?.some(v => /perday|daily|tokensperday/i.test(v.quotaId ?? '')))) return true;
  } catch { /* Unstructured responses are not surfaced. */ }
  return isAIQuotaError(e.cause);
}