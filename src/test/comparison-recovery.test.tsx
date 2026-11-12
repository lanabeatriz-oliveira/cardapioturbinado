import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { comparisonEvidence } from '@/lib/comparison-payload';
import { imageDimensions } from '@/lib/menu-images';
import { aiErrorMessage } from '@/lib/analysis-errors';
import { CRITERIOS } from '@/lib/photo-rules';
import type { Resultado } from '@/lib/analyze.functions';
const mocks=vi.hoisted(()=>({analyze:vi.fn(),learn:vi.fn(),persist:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>({inputValidator:()=>({handler:()=>({})})}),useServerFn:(fn:unknown)=>fn}));
vi.mock('@/lib/analyze.functions',async()=>{const {z}=await import('zod');return {analisarCardapio:mocks.analyze,resultadoSchema:z.object({notaGeral:z.number(),resumo:z.string(),criterios:z.array(z.any()),numeros:z.any(),topAcoes:z.array(z.any())})};});
vi.mock('@/lib/compare.functions',()=>({aprenderConcorrentes:mocks.learn}));
vi.mock('@/components/save-analysis',()=>({persistCompetitors:mocks.persist}));
import { ComparisonPanel } from '@/components/comparison-panel';
const result:Resultado={notaGeral:72,resumo:'Teste',criterios:CRITERIOS.map(nome=>({nome,nota:7,explicacao:'Teste',exemplo:'X-Burger'})),topAcoes:[],reescrito:[{nomeAntes:'X-Burger',descricaoAntes:'Carne 150g',nomeDepois:'NOME NOVO',descricaoDepois:'REESCRITA',preco:'25',observacao:'OBS'}],combos:[],numeros:{totalItens:1,itensComDescricao:1,totalBurgers:1,burgersComPeso:1,burgersComFoto:null,combos:0,adicionais:0,menorPrecoBurger:25,maiorPrecoBurger:25,precoMedioBurger:25,incoerenciasPreco:0}};
beforeEach(()=>{cleanup();vi.clearAllMocks();});
describe('Recuperação da comparação',()=>{
 it('limita prints de celular a 1600px sem ampliar imagens menores',()=>{expect(imageDimensions(2400,4000)).toEqual({width:960,height:1600});expect(imageDimensions(800,600)).toEqual({width:800,height:600});});
 it('envia somente nomes e descrições originais, não reescrita nem combos sugeridos',()=>{const payload=comparisonEvidence(result);expect(payload.itensAntes).toEqual([{nomeAntes:'X-Burger',descricaoAntes:'Carne 150g'}]);expect(payload).not.toHaveProperty('reescrito');expect(payload).not.toHaveProperty('combos');expect(JSON.stringify(payload)).not.toContain('REESCRITA');});
 it('informa limite temporário 429',()=>expect(aiErrorMessage({cause:{statusCode:429}},'fallback')).toBe('Muitas análises agora. Tente de novo em instantes.'));
 it('informa créditos 402 sem resposta segura',()=>expect(aiErrorMessage({statusCode:402},'fallback')).toBe('Os créditos de IA acabaram. Fale com o responsável pelo app.'));
 it('preserva motivo seguro de bloqueio 403, sem atribuir todo bloqueio a créditos',()=>expect(aiErrorMessage({statusCode:403,responseBody:JSON.stringify({message:'Provider access denied'})},'fallback')).toBe('Provider access denied'));
 it('identifica quem falhou e reaproveita o concorrente já analisado',async()=>{
  mocks.analyze.mockResolvedValueOnce(result).mockRejectedValueOnce(new Error('Falha na imagem')).mockResolvedValueOnce(result);mocks.learn.mockResolvedValue([]);
  render(<ComparisonPanel r={result} saved={null} value={null} onChange={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Comparar com até 3 concorrentes'}));
  fireEvent.change(screen.getByLabelText('Nome concorrente 1'),{target:{value:'A'}});fireEvent.change(screen.getByLabelText('Texto concorrente 1'),{target:{value:'Burger A'}});
  fireEvent.click(screen.getByRole('button',{name:'Adicionar concorrente'}));fireEvent.change(screen.getByLabelText('Nome concorrente 2'),{target:{value:'B'}});fireEvent.change(screen.getByLabelText('Texto concorrente 2'),{target:{value:'Burger B'}});
  fireEvent.click(screen.getByRole('button',{name:'Analisar concorrentes'}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('Concorrente 2 (B): Falha na imagem'));
  expect(mocks.analyze).toHaveBeenCalledTimes(2);fireEvent.click(screen.getByRole('button',{name:'Analisar concorrentes'}));await waitFor(()=>expect(mocks.learn).toHaveBeenCalledTimes(1));expect(mocks.analyze).toHaveBeenCalledTimes(3);expect(mocks.analyze.mock.calls[2]?.[0].data.nome).toBe('B');
 });
 it('preserva e salva os resultados mesmo quando as ações falham',async()=>{
  mocks.analyze.mockResolvedValue(result);mocks.learn.mockRejectedValue(new Error('Muitas análises agora.'));mocks.persist.mockResolvedValue({ok:true});const changed=vi.fn();
  render(<ComparisonPanel r={result} saved={{id:'id',token:'token'}} value={null} onChange={changed}/>);fireEvent.click(screen.getByRole('button',{name:'Comparar com até 3 concorrentes'}));fireEvent.change(screen.getByLabelText('Nome concorrente 1'),{target:{value:'A'}});fireEvent.change(screen.getByLabelText('Texto concorrente 1'),{target:{value:'Burger'}});fireEvent.click(screen.getByRole('button',{name:'Analisar concorrentes'}));await waitFor(()=>expect(mocks.persist).toHaveBeenCalledTimes(1));expect(changed.mock.calls[0]?.[0].concorrentes).toHaveLength(1);expect(screen.getByRole('alert').textContent).toContain('Muitas análises agora.');
 });
});