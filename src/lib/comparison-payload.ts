import { resultadoSchema, type Resultado } from './analyze.functions';
import { z } from 'zod';

export const comparisonEvidenceSchema = resultadoSchema.pick({
  notaGeral: true, resumo: true, criterios: true, numeros: true, topAcoes: true,
}).extend({ itensAntes: z.array(z.object({ nomeAntes: z.string(), descricaoAntes: z.string() })) });

export function comparisonEvidence(r: Resultado) {
  return { notaGeral: r.notaGeral, resumo: r.resumo, criterios: r.criterios,
    numeros: r.numeros, topAcoes: r.topAcoes,
    itensAntes: r.reescrito.map(({ nomeAntes, descricaoAntes }) => ({ nomeAntes, descricaoAntes })) };
}