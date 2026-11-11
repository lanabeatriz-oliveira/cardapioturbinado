// Busca uma página de cardápio e extrai texto útil (HTML visível + JSON embutido).
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function decode(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Junta strings relevantes de um JSON (nomes, descrições, preços).
function jsonParaTexto(obj: unknown, out: string[], depth = 0) {
  if (depth > 40 || out.length > 4000) return;
  if (Array.isArray(obj)) return obj.forEach((x) => jsonParaTexto(x, out, depth + 1));
  if (obj && typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    const nome = o["name"] ?? o["nome"] ?? o["title"];
    const desc = o["description"] ?? o["details"] ?? o["descricao"];
    const preco = o["unitPrice"] ?? o["price"] ?? o["preco"] ?? (o["offers"] as any)?.price;
    if (typeof (o["name"] ?? o["nome"] ?? o["title"]) === "string" && (desc || preco !== undefined)) {
      out.push(
        [String(o["name"] ?? o["nome"] ?? o["title"]), typeof desc === "string" ? desc : "", preco !== undefined && typeof preco !== "object" ? `R$ ${preco}` : ""]
          .filter(Boolean)
          .join(" — "),
      );
    } else if (typeof nome === "string" && /card|menu|categor/i.test(Object.keys(o).join(" "))) {
      out.push(`## ${nome}`);
    }
    for (const v of Object.values(o)) if (v && typeof v === "object") jsonParaTexto(v, out, depth + 1);
  }
}

export async function lerLink(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  let html = "";
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "pt-BR,pt;q=0.9" },
    });
    if (!res.ok) return "";
    html = (await res.text()).slice(0, 3_000_000);
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }

  const estruturado: string[] = [];
  const blocos = [
    ...html.matchAll(/<script[^>]*(?:id="__NEXT_DATA__"|type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const b of blocos) {
    try { jsonParaTexto(JSON.parse(b[1] ?? ""), estruturado); } catch { /* ignora */ }
  }

  const visivel = decode(
    html
      .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|section)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  const texto = [...new Set(estruturado)].join("\n") + "\n\n" + visivel;
  return texto.slice(0, 40000).trim();
}

// Heurística: parece cardápio se tem vários preços.
export function pareceCardapio(texto: string) {
  return (texto.match(/R\$\s?\d|\d+[.,]\d{2}/g) || []).length >= 3;
}
