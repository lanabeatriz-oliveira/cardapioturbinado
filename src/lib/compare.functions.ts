import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {comparisonEvidenceSchema} from './comparison-payload';
import {aiErrorMessage} from './analysis-errors';
export const aprenderConcorrentes=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({principal:comparisonEvidenceSchema,concorrentes:z.array(z.object({nome:z.string(),resultado:comparisonEvidenceSchema})).min(1).max(3)}).parse(input)).handler(async({data})=>{
 const {runGemini,geminiOptions}=await import('./gemini.server');const {generateText,Output}=await import('ai');
 try {
  const schema=z.object({acoes:z.array(z.object({titulo:z.string(),detalhe:z.string()}))});
  const output=await runGemini('aprenderConcorrentes',async model=>{
   const result=await generateText({model,maxRetries:0,system:'Responda em português do Brasil. Gere exatamente 3 ações práticas que a hamburgueria principal pode aprender dos concorrentes. Baseie-se EXCLUSIVAMENTE nas evidências das análises fornecidas, cite nome do concorrente e item/evidência observada. Nunca invente ingredientes, itens, preços ou garantias de vendas. Fotos não avaliadas não são evidência. Não confunda sugestões com itens realmente existentes: use itensAntes e numeros/criterios. Se evidência for insuficiente, diga isso e proponha verificar, não invente.',prompt:JSON.stringify(data),providerOptions:geminiOptions,output:Output.object({schema})});
   return result.output;
  });
  return schema.extend({acoes:schema.shape.acoes.length(3)}).parse(output).acoes;
 }catch(error){throw new Error(aiErrorMessage(error,'Não consegui preparar as ações. Tente novamente.'));}
});
