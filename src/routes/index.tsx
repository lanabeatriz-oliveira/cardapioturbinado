import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { analisarCardapio, type Resultado } from "@/lib/analyze.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardápio Turbo — Otimize seu cardápio de delivery com IA" },
      { name: "description", content: "Descubra o que está fazendo seu cardápio perder pedidos. Análise com IA, notas e cardápio reescrito." },
      { property: "og:title", content: "Cardápio Turbo" },
      { property: "og:description", content: "Descubra o que está fazendo seu cardápio perder pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Etapa = "inicio" | "entrada" | "carregando" | "resultado";

const MENSAGENS = [
  "Lendo seu cardápio...",
  "Entendendo cada prato...",
  "Comparando preços e porções...",
  "Montando combos...",
  "Reescrevendo as descrições...",
];

function redimensionar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function Index() {
  const [etapa, setEtapa] = useState<Etapa>("inicio");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [texto, setTexto] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const analisar = useServerFn(analisarCardapio);

  async function enviar() {
    setErro("");
    if (!texto.trim() && !imagens.length) return setErro("Envie uma foto ou cole o texto do cardápio.");
    setEtapa("carregando");
    try {
      const r = await analisar({ data: { texto, imagens, nome } });
      setResultado(r);
      setEtapa("resultado");
      window.scrollTo(0, 0);
    } catch (e: any) {
      setErro(e?.message || "Algo deu errado. Tente novamente.");
      setEtapa("entrada");
    }
  }

  function reiniciar() {
    setTexto(""); setImagens([]); setNome(""); setResultado(null);
    setEtapa("entrada"); window.scrollTo(0, 0);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      {etapa === "inicio" && (
        <section className="flex min-h-[85vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-hot text-3xl shadow-card">🔥</div>
          <h1 className="text-5xl font-extrabold tracking-tight">Cardápio <span className="text-primary">Turbo</span></h1>
          <p className="mt-4 max-w-sm text-lg text-muted-foreground">Descubra o que está fazendo sua hamburgueria perder pedidos</p>
          <button onClick={() => setEtapa("entrada")} className="mt-8 rounded-full bg-hot px-8 py-4 text-lg font-bold text-primary-foreground shadow-card transition hover:scale-105">
            Analisar meu cardápio
          </button>
        </section>
      )}

      {etapa === "entrada" && (
        <section className="space-y-5">
          <h2 className="text-3xl font-extrabold">Seu cardápio</h2>
          <div className="rounded-3xl bg-card p-5 shadow-card">
            <label className="font-bold">📸 Fotos do cardápio</label>
            <input type="file" accept="image/*" multiple className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-bold file:text-accent-foreground"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const novas = await Promise.all(files.map(redimensionar));
                setImagens((a) => [...a, ...novas].slice(0, 6));
                e.target.value = "";
              }} />
            {imagens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imagens.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`Foto ${i + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                    <button aria-label="Remover foto" onClick={() => setImagens((a) => a.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-foreground text-xs text-background">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-card p-5 shadow-card">
            <label className="font-bold" htmlFor="texto">📝 Ou cole o texto</label>
            <textarea id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={7} placeholder={"X-Salada - R$ 25\nPão brioche, blend 150g, queijo prato, alface, tomate, molho da casa\nBatata frita - R$ 18\nCoca-Cola 350ml - R$ 8"} className="mt-3 w-full rounded-2xl border bg-background p-3 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da hamburgueria (opcional)" className="w-full rounded-2xl border bg-card p-3 outline-none focus:ring-2 focus:ring-ring" />
          {erro && <p className="rounded-2xl bg-destructive/10 p-3 font-medium text-destructive">{erro}</p>}
          <button onClick={enviar} className="w-full rounded-full bg-hot py-4 text-lg font-bold text-primary-foreground shadow-card">Analisar agora</button>
        </section>
      )}

      {etapa === "carregando" && <Carregando />}
      {etapa === "resultado" && resultado && <ResultadoView r={resultado} onNovo={reiniciar} />}
    </main>
  );
}

function Carregando() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MENSAGENS.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-primary" />
      <p className="mt-6 text-xl font-bold">{MENSAGENS[i]}</p>
      <p className="mt-2 text-sm text-muted-foreground">Isso pode levar até um minuto.</p>
    </section>
  );
}

function corNota(n: number, max: number) {
  const p = n / max;
  return p >= 0.7 ? "text-success" : p >= 0.4 ? "text-warning" : "text-destructive";
}

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
      {ok ? "Copiado ✓" : "Copiar"}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-card p-5 shadow-card">{children}</div>;
}

function ResultadoView({ r, onNovo }: { r: Resultado; onNovo: () => void }) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-hot p-6 text-center text-primary-foreground shadow-card">
        <p className="font-bold uppercase tracking-widest opacity-90">Nota geral</p>
        <p className="font-display text-7xl font-extrabold">{Math.round(r.notaGeral)}<span className="text-3xl opacity-80">/100</span></p>
        <p className="mt-2">{r.resumo}</p>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-extrabold">🚀 Top 3 ações</h2>
        <div className="space-y-3">
          {r.topAcoes.map((a, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <div><p className="font-bold">{a.titulo}</p><p className="text-muted-foreground">{a.detalhe}</p></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-extrabold">📊 Critérios</h2>
        <div className="space-y-3">
          {r.criterios.map((c, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{c.nome}</p>
                <p className={`font-display text-2xl font-extrabold ${corNota(c.nota, 10)}`}>{c.nota}<span className="text-sm text-muted-foreground">/10</span></p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-hot" style={{ width: `${c.nota * 10}%` }} /></div>
              <p className="mt-3">{c.explicacao}</p>
              <p className="mt-2 rounded-xl bg-muted p-3 text-sm italic text-muted-foreground">Ex.: {c.exemplo}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-extrabold">✍️ Cardápio reescrito</h2>
        <div className="space-y-3">
          {r.reescrito.map((it, i) => (
            <Card key={i}>
              <p className="text-xs font-bold uppercase text-muted-foreground">Antes</p>
              <p className="font-medium line-through decoration-muted-foreground/40">{it.nomeAntes}</p>
              {it.descricaoAntes && <p className="text-sm text-muted-foreground">{it.descricaoAntes}</p>}
              <p className="mt-3 text-xs font-bold uppercase text-primary">Depois</p>
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-bold">{it.nomeDepois}</p>
                {it.preco && <span className="shrink-0 font-bold text-primary">{it.preco}</span>}
              </div>
              <p>{it.descricaoDepois}</p>
              {it.observacao && <p className="mt-2 rounded-xl bg-accent p-2 text-sm text-accent-foreground">💡 {it.observacao}</p>}
              <div className="mt-3"><Copiar texto={`${it.nomeDepois}\n${it.descricaoDepois}`} /></div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-extrabold">🍱 Combos sugeridos</h2>
        <div className="space-y-3">
          {r.combos.map((c, i) => (
            <Card key={i}>
              <p className="text-lg font-bold">{c.nome}</p>
              <div className="mt-2 flex flex-wrap gap-2">{c.itens.map((x, j) => <span key={j} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{x}</span>)}</div>
              <p className="mt-2 text-muted-foreground">{c.motivo}</p>
            </Card>
          ))}
        </div>
      </div>

      <button onClick={onNovo} className="w-full rounded-full bg-hot py-4 text-lg font-bold text-primary-foreground shadow-card">Analisar outro cardápio</button>
    </section>
  );
}
