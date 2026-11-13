import {describe, it, expect, vi} from 'vitest';
import {aiErrorMessage} from '@/lib/analysis-errors';
const mocks = vi.hoisted(() => ({create: vi.fn(), model: vi.fn()}));
vi.mock('@ai-sdk/google', () => ({createGoogle: mocks.create}));
import {createGeminiModel} from '@/lib/gemini.server';
describe('Gemini', () => {
  it('usa o Flash gratuito com imagens confirmado na documentação oficial', () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-only');
    mocks.create.mockReturnValue(mocks.model);
    createGeminiModel();
    expect(mocks.model).toHaveBeenCalledWith('gemini-3.8-flash');
    vi.unstubAllEnvs();
  });
  it('mantém o aviso de muitas análises para limite temporário 429', () => {
    expect(aiErrorMessage({statusCode:429}, 'fallback')).toBe('Muitas análises agora. Tente de novo em instantes.');
  });
  it('informa créditos esgotados quando o Gemini retorna cota diária 429', () => {
    expect(aiErrorMessage({statusCode:429, responseBody:JSON.stringify({error:{details:[{violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]}]}})}, 'fallback')).toBe('Os créditos de IA acabaram. Fale com o responsável pelo app.');
  });
});