import {createFileRoute,Link} from '@tanstack/react-router';
import {ABOUT,LINKEDIN_URL,pageHead} from '@/lib/site';
export const Route=createFileRoute('/sobre')({head:()=>pageHead('Sobre','Conheça Lana e o propósito do Cardápio Turbo, análise gratuita para hamburguerias.'),component:Sobre});
function Sobre(){return <main className="mx-auto max-w-2xl px-4 py-12 space-y-6"><Link to="/" className="text-primary">← Cardápio Turbo</Link><h1 className="text-4xl font-bold">Sobre</h1><p className="text-lg leading-relaxed">{ABOUT}</p>{LINKEDIN_URL?<a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-primary underline">LinkedIn da Lana</a>:<p className="text-muted-foreground">LinkedIn da Lana — em breve</p>}</main>;}
