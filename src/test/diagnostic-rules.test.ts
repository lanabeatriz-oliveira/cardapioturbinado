import {describe, it, expect} from 'vitest';
import {aiFailure} from '@/lib/diagnostic-rules';
describe('Diagnóstico de IA', () => {
  it('créditos insuficientes bloqueiam o diagnóstico, preservando o motivo', () => {expect(aiFailure(402, 'Créditos insuficientes')).toEqual({status: 'blocked', message: 'Créditos insuficientes'});});
  it('permissão negada não indica crédito disponível', () => {expect(aiFailure(403, 'Limite de IA atingido').status).toBe('blocked');});
  it('chave inválida indica erro de configuração', () => {expect(aiFailure(401).status).toBe('error');});
});