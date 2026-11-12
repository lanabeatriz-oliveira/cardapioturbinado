import {createFileRoute,Link} from '@tanstack/react-router';
import {z} from 'zod';
import {FeedbackForm} from '@/components/feedback-form';
import {pageHead} from '@/lib/site';
import {getTokenAnalysis} from '@/lib/research.functions';
export const Route=createFileRoute('/retorno/$token')({head:()=>({...pageHead('Pesquisa de retorno','Conte como foi a aplicação das sugestões do Cardápio Turbo.'),meta:[...pageHead('Pesquisa de retorno','Conte como foi a aplicação das sugestões do Cardápio Turbo.').meta,{name:'robots',content:'noindex,nofollow'}]}),loader:async({params})=>z.string().uuid().safeParse(params.token).success?getTokenAnalysis({data:{token:params.token}}):null,component:Retorno});
function Retorno(){const a=Route.useLoaderData();const {token}=Route.useParams();return <main className="mx-auto max-w-xl px-4 py-10 space-y-6"><Link to="/" className="text-primary">Cardápio Turbo</Link><h1 className="text-3xl font-bold">{a?`Retorno · ${a.nome_hamburgueria}`:'Link não encontrado'}</h1>{a?<FeedbackForm token={token} momento="retorno"/>:<p>Confira o link recebido.</p>}</main>;}
