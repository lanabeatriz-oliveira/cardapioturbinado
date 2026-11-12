export function aiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as { statusCode?: number; cause?: unknown };
  return e.statusCode ?? aiErrorStatus(e.cause);
}

export function aiErrorMessage(error: unknown, fallback: string): string {
  const status = aiErrorStatus(error);
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