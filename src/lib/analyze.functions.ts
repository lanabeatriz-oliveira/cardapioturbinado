import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const criterio = z.object({
  nome: z.string(),
  nota: z.number(),
  explicacao: z.string(),
  exemplo: z.string(),
});

export const resultadoSchema = z.object({
  notaGeral: z.number(),
  resumo: z.string(),
  criterios: z.array(criterio),
  topAcoes: z.array(z.object({ titulo: z.string(), detalhe: z.string() })),
  reescrito: z.array(
    z.object({
      nomeAntes: z.string(),
      descricaoAntes: z.string(),
      nomeDepois: z.string(),
      descricaoDepois: z.string(),
      preco: z.string(),
      observacao: z.string(),
    }),
  ),
  combos: z.array(
    z.object({ nome: z.string(), itens: z.array(z.string()), motivo: z.string() }),
  ),
  numeros: z.object({
    totalItens: z.number(),
    itensComDescricao: z.number(),
    totalBurgers: z.number(),
    burgersComPeso: z.number(),
    combos: z.number(),
    adicionais: z.number(),
    menorPrecoBurger: z.number().nullable(),
    maiorPrecoBurger: z.number().nullable(),
    precoMedioBurger: z.number().nullable(),
    incoerenciasPreco: z.number(),
  }),
});
export type Resultado = z.infer<typeof resultadoSchema>;

const SYSTEM = `Você é um consultor de cardápios de delivery especializado em hamburguerias brasileiras. Responda sempre em português do Brasil, com tom amigável, direto e sem jargão.
Leia o cardápio (texto e/ou fotos) e analise-o.
REGRAS OBRIGATÓRIAS:
- Nunca invente ingredientes, preços ou itens que não estejam no cardápio. Se faltar informação, sugira que o dono a acrescente (ex.: "informe o peso", "[informe os ingredientes]").
- Não altere preços; apenas aponte incoerências. No campo "preco" copie o preço exatamente como está (ou "" se não houver).
- Combos só com itens que já existem no cardápio; não sugira preço de combo.
- Se o cardápio claramente não for de hamburgueria, analise mesmo assim e avise isso no resumo.
Estrutura:
- notaGeral: 0 a 100.
- criterios: exatamente 7, nesta ordem e com estes nomes: "Nome claro", "Descrição que dá vontade", "Informação de porção", "Coerência de preço", "Combos e adicionais", "Organização", "Destaques e erros". nota de 0 a 10; explicacao curta; exemplo citando algo real do cardápio.
- topAcoes: exatamente 3, as de maior impacto, em linguagem simples.
- reescrito: todos os itens do cardápio (até 30), antes e depois de nome e descrição. "observacao" diz o que o dono precisa completar, ou "".
- combos: 2 ou 3.
- numeros: contagens REAIS do cardápio original (não estime vendas). totalItens = todos os itens à venda; itensComDescricao = itens que já têm descrição; totalBurgers = hambúrgueres/lanches; burgersComPeso = burgers com gramatura/peso informado; combos = combos existentes no cardápio; adicionais = adicionais existentes; menor/maior/precoMedioBurger em reais (número, ex.: 29.9), null se não houver preços; incoerenciasPreco = quantidade de incoerências de preço que você apontou.
O QUE AVALIAR EM CADA CRITÉRIO:
- "Nome claro": nomes criativos (ex.: "X-Monstro") precisam deixar claro o que vem no lanche.
- "Descrição que dá vontade": tipo de pão, blend/carne, queijo, molho da casa, acompanhamentos dentro do lanche, textura (crocante, suculento, cremoso).
- "Informação de porção": gramatura do blend (ex.: 150g, 180g), quantidade de carnes (simples/duplo/triplo), se a batata é individual ou para dividir.
- "Coerência de preço": lanche com mais ingredientes mais barato que um mais simples; versão dupla que não compensa; preço de batata/bebida avulsas vs. em combo.
- "Combos e adicionais": combo lanche + batata + bebida, adicionais (bacon, cheddar extra, carne extra, ovo), opção de dobrar a carne, sobremesa.
- "Organização": categorias típicas (Burgers, Combos, Acompanhamentos, Bebidas, Sobremesas, Adicionais) e excesso de lanches parecidos.
- "Destaques e erros": indicar o carro-chefe/mais pedido, ponto da carne quando aplicável, opções vegetarianas se existirem, erros de português e itens duplicados.`;

export const analisarCardapio = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { texto: string; imagens: string[]; nome: string; link?: string }) => {
      if (!input.texto?.trim() && !input.imagens?.length && !input.link?.trim())
        throw new Error("Envie um link, uma foto ou cole o texto do cardápio.");
      if (input.link?.trim() && !/^https?:\/\/[^\s]+$/i.test(input.link.trim()))
        throw new Error("Esse link não parece válido. Ele deve começar com https://");
      if (input.imagens.length > 6) throw new Error("Envie no máximo 6 fotos.");
      return input;
    },
  )
  .handler(async ({ data }) => {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("IA não configurada.");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    let doLink = "";
    if (data.link?.trim()) {
      const { lerLink, pareceCardapio } = await import("./link.server");
      const lido = await lerLink(data.link.trim());
      if (pareceCardapio(lido)) doLink = lido;
      else if (!data.texto?.trim() && !data.imagens.length)
        throw new Error("Não consegui ler esse link. Tente colar o texto do cardápio ou enviar prints (até 6).");
    }
    const intro = `Restaurante: ${data.nome || "(não informado)"}\n\nCardápio em texto:\n${data.texto || "(veja as fotos ou o link)"}${doLink ? `\n\nConteúdo extraído do link do cardápio (pode ter textos do site misturados; use só os itens do cardápio):\n${doLink}` : ""}`;
    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      maxRetries: 0,
      output: Output.object({ schema: resultadoSchema }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: intro },
            ...data.imagens.map((img) => ({ type: "image" as const, image: img })),
          ],
        },
      ],
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    try {
      return (await result.output) as Resultado;
    } catch (e: any) {
      const status = e?.statusCode ?? e?.cause?.statusCode;
      if (status === 429) throw new Error("Muitas análises agora. Tente de novo em instantes.");
      if (status === 402 || status === 403)
        throw new Error("Os créditos de IA acabaram. Fale com o responsável pelo app.");
      console.error(e);
      throw new Error("Não consegui analisar o cardápio. Tente novamente.");
    }
  });
