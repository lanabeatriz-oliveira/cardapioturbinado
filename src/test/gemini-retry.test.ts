import {describe,it,expect,vi} from 'vitest';
import {withGeminiAvailability,GEMINI_PRIMARY,GEMINI_FALLBACK} from '@/lib/gemini-retry';
import {aiErrorMessage} from '@/lib/analysis-errors';
describe('Recuperação Gemini',()=>{
 it('503 faz duas novas tentativas com espera antes da alternativa gratuita',async()=>{
  const call=vi.fn().mockRejectedValueOnce({statusCode:503}).mockRejectedValueOnce({statusCode:503}).mockRejectedValueOnce({statusCode:503}).mockResolvedValue('OK');const wait=vi.fn().mockResolvedValue(undefined);
  expect(await withGeminiAvailability(call,wait)).toBe('OK');
  expect(call.mock.calls.map(c=>c[0])).toEqual([GEMINI_PRIMARY,GEMINI_PRIMARY,GEMINI_PRIMARY,GEMINI_FALLBACK]);expect(wait.mock.calls).toEqual([[1000],[2000]]);
 });
 it('429 não repete nem troca modelo',async()=>{const call=vi.fn().mockRejectedValue({statusCode:429});await expect(withGeminiAvailability(call,vi.fn())).rejects.toEqual({statusCode:429});expect(call).toHaveBeenCalledTimes(1);});
 it('503 persistente informa sobrecarga e prazo de um minuto',()=>{expect(aiErrorMessage({statusCode:503},'fallback')).toBe('A IA está sobrecarregada agora. Tente de novo em 1 minuto.');});
});