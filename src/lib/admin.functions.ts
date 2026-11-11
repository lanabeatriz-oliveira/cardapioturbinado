import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {followupDate} from './followup';
export const loadAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:allowed}=await context.supabase.rpc('is_lana_admin');if(!allowed)throw new Error('Acesso exclusivo da Lana.');
 const analyses=[];const feedbacks=[];for(let offset=0;;offset+=1000){const {data,error}=await context.supabase.from('analises').select('*').order('criado_em',{ascending:false}).range(offset,offset+999);if(error)throw new Error('Não consegui carregar as análises.');analyses.push(...(data??[]));if((data?.length??0)<1000)break;}
 for(let offset=0;;offset+=1000){const {data,error}=await context.supabase.from('feedbacks').select('*').order('criado_em').range(offset,offset+999);if(error)throw new Error('Não consegui carregar as pesquisas.');feedbacks.push(...(data??[]));if((data?.length??0)<1000)break;}
 return {analyses,feedbacks};
});
export const updateAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>z.object({id:z.string().uuid(),days:z.number().int().min(1).max(365).optional(),sent:z.boolean().optional()}).parse(input)).handler(async({context,data})=>{
 const {data:allowed}=await context.supabase.rpc('is_lana_admin');if(!allowed)throw new Error('Acesso exclusivo da Lana.');const {data:a,error}=await context.supabase.from('analises').select('criado_em').eq('id',data.id).single();if(error||!a)throw new Error('Análise não encontrada.');
 const patch={...(data.days!==undefined?{dias_followup:data.days,data_followup:followupDate(a.criado_em??new Date().toISOString(),data.days)}:{}),...(data.sent!==undefined?{followup_enviado:data.sent}:{})};const {error:err}=await context.supabase.from('analises').update(patch).eq('id',data.id);if(err)throw new Error('Não consegui atualizar.');return {ok:true};
});
