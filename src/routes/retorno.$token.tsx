import {createFileRoute,Link} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {FeedbackForm} from '@/components/feedback-form';
import {pageHead} from '@/lib/site';
import type {Database} from '@/integrations/supabase/types';
const readAnalysis=createServerFn({method:'GET'}).inputValidator((input:unknown)=>z.object({token:z.string().uuid()}).parse(input)).handler(async({data})=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'],url=process.env['SUPABASE_URL'];if(!key||!url)throw new Error('Serviço indisponível.');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data:rows,error}=await client.rpc('analysis_by_token',{p_token:data.token});if(error)throw new Error('Não consegui abrir a pesquisa.');return rows?.[0]??null;
});
export const Route=createFileRoute('/retorno/$token')({head:()=>({...pageHead('Pesquisa de retorno','Conte como foi a aplicação das sugestões do Cardápio Turbo.'),meta:[...pageHead('Pesquisa de retorno','Conte como foi a aplicação das sugestões do Cardápio Turbo.').meta,{name:'robots',content:'noindex,nofollow'}]}),loader:async({params})=>z.string().uuid().safeParse(params.token).success?readAnalysis({data:{token:params.token}}):null,component:Retorno});
function Retorno(){const a=Route.useLoaderData();const {token}=Route.useParams();return <main className="mx-auto max-w-xl px-4 py-10 space-y-6"><Link to="/" className="text-primary">Cardápio Turbo</Link><h1 className="text-3xl font-bold">{a?`Retorno · ${a.nome_hamburgueria}`:'Link não encontrado'}</h1>{a?<FeedbackForm token={token} momento="retorno"/>:<p>Confira o link recebido.</p>}</main>;}
