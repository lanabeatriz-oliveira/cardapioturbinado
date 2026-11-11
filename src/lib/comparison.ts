import type { Resultado } from './analyze.functions';
export type Concorrente = { nome: string; resultado: Resultado };
export type Comparacao = { concorrentes: Concorrente[]; acoes: { titulo: string; detalhe: string }[] };
export function comparisonRows(results: Resultado[]) {
 const fraction=(a:number|null,b:number)=>a==null||b===0?null:Math.round(a/b*100);
 const rows: {label:string; values:(number|null)[]; kind?:string; direction?:'min'|'max'}[]=[{label:'Nota geral',values:results.map(r=>r.notaGeral),direction:'max'}];
 results[0]?.criterios.forEach(c=>rows.push({label:c.nome,values:results.map(r=>r.criterios.find(x=>x.nome===c.nome)?.nota??null),direction:'max'}));
 for(const [label,key] of [['Preço médio','precoMedioBurger'],['Menor preço','menorPrecoBurger'],['Maior preço','maiorPrecoBurger']] as const) rows.push({label,values:results.map(r=>r.numeros[key]),kind:'currency',direction:'min'});
 for(const [label,key,den] of [['% com descrição','itensComDescricao','totalItens'],['% com peso','burgersComPeso','totalBurgers'],['% com foto','burgersComFoto','totalBurgers']] as const) rows.push({label,values:results.map(r=>fraction(r.numeros[key],r.numeros[den])),kind:'percent',direction:'max'});
 for(const [label,key] of [['Combos','combos'],['Adicionais','adicionais']] as const) rows.push({label,values:results.map(r=>r.numeros[key]),direction:'max'});
 return rows;
}
export function leader(values:(number|null)[],direction:'min'|'max'='max') {const valid=values.filter((v):v is number=>v!==null);return valid.length?Math[direction](...valid):null;}
export function formatValue(v:number|null,kind?:string){return v==null?'—':kind==='currency'?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):`${v}${kind==='percent'?'%':''}`;}
