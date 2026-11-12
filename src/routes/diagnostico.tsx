import {createFileRoute, Link} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';
import {useState} from 'react';
import {ShieldCheck, Sparkles, RefreshCw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {checkAccount, checkAI} from '@/lib/diagnostic.functions';
import type {DiagnosticState} from '@/lib/diagnostic-rules';
import {pageHead} from '@/lib/site';
export const Route = createFileRoute('/diagnostico')({head: () => pageHead('Diagnóstico', 'Verificação privada do acesso administrativo e da disponibilidade de IA do Cardápio Turbo.'), component: Diagnostic});
function Diagnostic() {
  const accountCheck = useServerFn(checkAccount), aiCheck = useServerFn(checkAI);
  const [account, setAccount] = useState<{allowed: boolean; message: string} | null>(null);
  const [ai, setAI] = useState<DiagnosticState | null>(null);
  const [busy, setBusy] = useState<'account' | 'ai' | null>(null);
  async function verifyAccount() {setBusy('account'); setAI(null); try {setAccount(await accountCheck());} catch {setAccount({allowed: false, message: 'Entre com sua conta da Lana para verificar o acesso.'});} finally {setBusy(null);}}
  async function verifyAI() {setBusy('ai'); try {setAI(await aiCheck());} catch {setAI({status: 'error', message: 'Entre com sua conta administrativa antes de verificar a IA.'});} finally {setBusy(null);}}
  return <main className="mx-auto max-w-2xl px-4 py-12 space-y-8"><Link to="/" className="text-primary">← Cardápio Turbo</Link><h1 className="text-3xl font-bold">Diagnóstico</h1><section className="space-y-4 border-b pb-6"><h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck aria-hidden size={22}/>Conta administrativa</h2><p role="status">{account?.message || 'Acesso ainda não verificado.'}</p><div className="flex flex-wrap gap-4 items-center"><Button disabled={busy !== null} onClick={verifyAccount}><RefreshCw size={16}/>{busy === 'account' ? 'Verificando...' : 'Verificar conta'}</Button><Link to="/auth" className="text-primary underline">Entrar na conta da Lana</Link>{account?.allowed && <Link to="/admin" className="text-primary underline">Abrir administração</Link>}</div></section><section className="space-y-4"><h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles aria-hidden size={22}/>Créditos e acesso à IA</h2><p role="status" className={ai?.status === 'blocked' || ai?.status === 'error' ? 'text-destructive' : ''}>{ai?.message || 'IA ainda não verificada.'}</p><p className="text-sm text-muted-foreground">A verificação envia uma solicitação curta e consome créditos de IA. O saldo exato e os limites ficam em Workspace settings → Plans & credits, no Lovable.</p><Button disabled={busy !== null || !account?.allowed} onClick={verifyAI}><RefreshCw size={16}/>{busy === 'ai' ? 'Verificando...' : 'Verificar IA e créditos'}</Button></section></main>;
}