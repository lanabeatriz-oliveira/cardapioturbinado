import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {comparisonEvidenceSchema} from './comparison-payload';
import {aiErrorMessage} from './analysis-errors';
export const aprenderConcorrentes=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({principal:comparisonEvidenceSchema,concorrentes:z.array(z.object({nome:z.string(),resultado:comparisonEvidenceSchema})).min(1).max(3)}).parse(input)).handler(async({data})=>{
 const {createOpenAI}=await import('@ai-sdk/openai');const {streamText,Output}=await import('ai');const key=process.env['LOVABLE_API_KEY'];if(!key)throw new Error('IA não configurada.');
 const {createLovableAiGatewayRunIdFetch}=await import('./diagnostic-run-id.server');
 const gateway=createLovableAiGatewayRunIdFetch();
 const provider=createOpenAI({baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:key,headers:{'Lovable-API-Key':key,'X-Lovable-AIG-SDK':'vercel-ai-sdk'},fetch:gateway.fetch});
 let providerError:unknown;
 try {
  const result=streamText({model:provider.responses('openai/gpt-6-astra'),maxRetries:0,onError:({error})=>{providerError=error;},instructions:'Responda em português do Brasil. Gere exatamente 3 ações práticas que a hamburgueria principal pode aprender dos concorrentes. Baseie-se EXCLUSIVAMENTE nas evidências das análises fornecidas, cite nome do concorrente e item/evidência observada. Nunca invente ingredientes, itens, preços ou garantias de vendas. Fotos não avaliadas não são evidência. Não confunda sugestões com itens realmente existentes: use itensAntes e numeros/criterios. Se evidência for insuficiente, diga isso e proponha verificar, não invente.',prompt:JSON.stringify(data),providerOptions:{openai:{forceReasoning:true,reasoningEffort:'low',reasoningSummary:'auto',store:false,include:['reasoning.encrypted_content']}},output:Output.object({schema:z.object({acoes:z.array(z.object({titulo:z.string(),detalhe:z.string()})).length(3)})})});
  return (await result.output).acoes;
 }catch(error){const original=providerError??error;console.error('[aprenderConcorrentes]',original);throw new Error(aiErrorMessage(original,'Não consegui preparar as ações. Tente novamente.'));}
});
