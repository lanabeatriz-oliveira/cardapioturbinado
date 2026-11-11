import type { Resultado } from "./analyze.functions";
import { ABOUT } from "./site";
import { comparisonRows, formatValue, type Comparacao } from "./comparison";
import { calcularNumeros } from "./numeros";

// Remove caracteres fora do Latin-1 (emojis), que a fonte padrão do PDF não tem.
const limpo = (s: string) => (s || "").replace(/[^\u0000-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC]/g, "").trim();

export function slug(s: string) {
  return (s || "hamburgueria").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "hamburgueria";
}

export async function gerarPdf(r: Resultado, nome: string, comparison: Comparacao | null = null, origin = ""): Promise<{ blob: Blob; filename: string }> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16, CW = W - M * 2, BOTTOM = 280;
  const LARANJA: [number, number, number] = [234, 88, 12];
  const CINZA: [number, number, number] = [100, 100, 100];
  let y = 0;

  const novaPagina = () => { doc.addPage(); y = M; };
  const espaco = (h: number) => { if (y + h > BOTTOM) novaPagina(); };
  const texto = (t: string, size = 10, opts: { bold?: boolean; color?: [number, number, number]; indent?: number } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color || [30, 30, 30]));
    const lh = size * 0.45;
    for (const linha of doc.splitTextToSize(limpo(t), CW - (opts.indent || 0))) {
      espaco(lh);
      doc.text(linha, M + (opts.indent || 0), y + lh * 0.8);
      y += lh;
    }
  };
  const titulo = (t: string) => {
    y += 4; espaco(14);
    doc.setFillColor(...LARANJA);
    doc.rect(M, y, 3, 7, "F");
    texto(t, 14, { bold: true, indent: 6 });
    y += 3;
  };

  // Cabeçalho
  doc.setFillColor(...LARANJA);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("Relatório Cardápio Turbo", M, 16);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text(limpo(nome || "Hamburgueria"), M, 25);
  doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), M, 31);
  doc.setFont("helvetica", "bold"); doc.setFontSize(30);
  doc.text(`${Math.round(r.notaGeral)}/100`, W - M, 24, { align: "right" });
  doc.setFontSize(9); doc.text("NOTA GERAL", W - M, 31, { align: "right" });
  y = 46;
  texto(r.resumo, 11);

  titulo("Raio-x em números");
  const nums = calcularNumeros(r);
  const colW = CW / 3;
  for (let i = 0; i < nums.length; i += 3) {
    espaco(20);
    nums.slice(i, i + 3).forEach((n, j) => {
      const x = M + j * colW;
      doc.setFillColor(255, 237, 224);
      doc.roundedRect(x, y, colW - 3, 17, 2, 2, "F");
      doc.setTextColor(...LARANJA); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      doc.text(limpo(n.valor), x + 3, y + 8);
      doc.setTextColor(...CINZA); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(doc.splitTextToSize(limpo(n.rotulo), colW - 8), x + 3, y + 13);
    });
    y += 20;
  }

  titulo("Top 3 ações");
  r.topAcoes.forEach((a, i) => { texto(`${i + 1}. ${a.titulo}`, 11, { bold: true }); texto(a.detalhe, 10, { indent: 5, color: CINZA }); y += 2; });

  titulo("Critérios");
  r.criterios.forEach((c) => {
    espaco(12);
    texto(`${c.nome} — ${c.nota == null ? "Não avaliado" : `${c.nota}/10`}`, 11, { bold: true, color: LARANJA });
    texto(c.explicacao, 10);
    if (c.exemplo) texto(`Ex.: ${c.exemplo}`, 9, { color: CINZA, indent: 4 });
    y += 2;
  });

  titulo("Cardápio reescrito");
  r.reescrito.forEach((it) => {
    espaco(18);
    texto(`ANTES: ${it.nomeAntes}${it.descricaoAntes ? ` — ${it.descricaoAntes}` : ""}`, 9, { color: CINZA });
    texto(`DEPOIS: ${it.nomeDepois}${it.preco ? `  (${it.preco})` : ""}`, 11, { bold: true });
    texto(it.descricaoDepois, 10);
    if (it.observacao) texto(`Dica: ${it.observacao}`, 9, { color: LARANJA, indent: 4 });
    y += 2;
    doc.setDrawColor(230, 230, 230); doc.line(M, y, W - M, y); y += 3;
  });

  titulo("Combos sugeridos");
  r.combos.forEach((c) => { texto(c.nome, 11, { bold: true }); texto(c.itens.join(" + "), 10, { color: LARANJA }); texto(c.motivo, 10, { color: CINZA }); y += 2; });

  if (comparison) {
    titulo("Comparação com concorrentes");
    const names = ["Você", ...comparison.concorrentes.map(c => c.nome)];
    texto("Preços: o menor valor não significa melhor produto.", 9, { color: CINZA });
    for (const row of comparisonRows([r, ...comparison.concorrentes.map(c => c.resultado)])) {
      texto(row.label, 10, { bold: true });
      row.values.forEach((value, i) => texto(`${names[i]}: ${formatValue(value, row.kind)}`, 9, { indent: 4 }));
      y += 2;
    }
    titulo("O que aprender com os concorrentes");
    comparison.acoes.forEach((a, i) => { texto(`${i + 1}. ${a.titulo}`, 11, { bold: true }); texto(a.detalhe); y += 2; });
  }
  titulo("Sobre o Cardápio Turbo");
  texto(ABOUT, 9);
  if (origin) { espaco(10); doc.setFontSize(10); doc.setTextColor(...LARANJA); doc.textWithLink("Sobre o Cardápio Turbo", M, y + 5, { url: `${origin}/sobre` }); y += 10; }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p); doc.setFontSize(8); doc.setTextColor(...CINZA); doc.setFont("helvetica", "normal");
    doc.text(`Cardápio Turbo · página ${p} de ${total}`, W / 2, 291, { align: "center" });
  }
  return { blob: doc.output("blob"), filename: `cardapio-turbo-${slug(nome)}.pdf` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if ((e as DOMException).name === "AbortError") return; }
  }
  downloadBlob(blob, filename);
}
