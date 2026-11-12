export const CRITERIOS = ['Nome claro','Descrição que dá vontade','Informação de porção','Coerência de preço','Combos e adicionais','Organização','Destaques e erros','Fotos dos produtos'] as const;
export function applyPhotoRules<T extends {criterios:{nome:string;nota:number|null;explicacao:string;exemplo:string}[];numeros:{burgersComFoto:number|null}}>(result:T,images:string[]):T {
 if(images.length===0){return {...result,criterios:result.criterios.map(c=>c.nome==='Fotos dos produtos'?{...c,nota:null,explicacao:'Não avaliado — envie prints com as fotos',exemplo:''}:c),numeros:{...result.numeros,burgersComFoto:null}};}
 return result;
}
