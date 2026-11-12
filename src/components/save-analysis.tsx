import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {sendCompetitors} from '@/lib/research.functions';
import {Button} from '@/components/ui/button';
import {FeedbackForm} from './feedback-form';
import {contactFields,followupDate} from '@/lib/followup';
import type {Resultado} from '@/lib/analyze.functions';
import type {Comparacao} from '@/lib/comparison';
export type SavedAnalysis={id:string;token:string};
export async function persistCompetitors(token:string,comparison:Comparacao){await sendCompetitors({data:{token,rows:comparison.concorrentes.map(c=>({nome:c.nome,nota_geral:Math.round(c.resultado.notaGeral),numeros:c.resultado.numeros,notas_criterios:c.resultado.criterios}))}});}
export function SaveAnalysis({r,nome,saved,onSaved,comparison}:{r:Resultado;nome:string;saved:SavedAnalysis|null;onSaved:(s:SavedAnalysis)=>void;comparison:Comparacao|null}){
 const [name,setName]=useState(nome),[owner,setOwner]=useState(''),[phone,setPhone]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 return <section className="space-y-4 rounded-3xl bg-card p-5 shadow-card"><h2 className="text-2xl font-bold">Salvar e acompanhar</h2>{saved?<><p role="status" className="text-success">Análise salva.</p><FeedbackForm token={saved.token} momento="imediato"/></>:<form className="space-y-3" onSubmit={async(e)=>{e.preventDefault();setBusy(true);setError('');try{const id=crypto.randomUUID(),token=crypto.randomUUID();const {error}=await supabase.from('analises').insert({id,token,nome_hamburgueria:name,...contactFields(consent,owner,phone),consentimento:consent,nota_geral:Math.round(r.notaGeral),numeros:r.numeros,dias_followup:7,data_followup:followupDate(new Date().toISOString(),7),followup_enviado:false});if(error)throw new Error(error.message);onSaved({id,token});if(comparison)await persistCompetitors(token,comparison);}catch(e){setError(e instanceof Error?e.message:'Não consegui salvar.');}finally{setBusy(false);}}}>
 {[['Nome da hamburgueria',name,setName],['Nome do dono',owner,setOwner],['WhatsApp',phone,setPhone]] .map(([label,value,set])=><label key={String(label)} className="block">{String(label)}<input aria-label={String(label)} required={label==='Nome da hamburgueria'} maxLength={200} type={label==='WhatsApp'?'tel':'text'} className="w-full rounded-lg border bg-background p-3" value={String(value)} onChange={e=>(set as (s:string)=>void)(e.target.value)}/></label>)}
 <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>Aceito ser contatado sobre os resultados (LGPD)</label><Button disabled={busy} type="submit">{busy?'Salvando...':'Salvar análise'}</Button></form>}{error&&<p role="alert" className="text-destructive">{error}</p>}</section>;
}
