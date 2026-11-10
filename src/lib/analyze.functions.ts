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
});
export type Resultado = z.infer<typeof resultadoSchema>;

const SYSTEM = `Você é um consultor de cardápios de delivery para pequenos restaurantes brasileiros. Responda sempre em português do Brasil, com tom amigável, direto e sem jargão.
Leia o cardápio (texto e/ou fotos) e analise-o.
REGRAS OBRIGATÓRIAS:
- Nunca invente ingredientes, preços ou itens que não estejam no cardápio. Se faltar informação, sugira que o dono a acrescente (ex.: "informe o peso", "[informe os ingredientes]").
- Não altere preços; apenas aponte incoerências. No campo "preco" copie o preço exatamente como está (ou "" se não houver).
- Combos só com itens que já existem no cardápio; não sugira preço de combo.
Estrutura:
- notaGeral: 0 a 100.
- criterios: exatamente 7, nesta ordem e com estes nomes: "Nome claro", "Descrição que dá vontade", "Informação de porção", "Coerência de preço", "Combos e adicionais", "Organização", "Destaques e erros". nota de 0 a 10; explicacao curta; exemplo citando algo real do cardápio.
- topAcoes: exatamente 3, as de maior impacto, em linguagem simples.
- reescrito: todos os itens do cardápio (até 30), antes e depois de nome e descrição. "observacao" diz o que o dono precisa completar, ou "".
- combos: 2 ou 3.`;

export const analisarCardapio = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { texto: string; imagens: string[]; nome: string; tipo: string }) => {
      if (!input.texto?.trim() && !input.imagens?.length)
        throw new Error("Envie uma foto ou cole o texto do cardápio.");
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
    const intro = `Restaurante: ${data.nome || "(não informado)"}\nTipo de comida: ${data.tipo || "(não informado)"}\n\nCardápio em texto:\n${data.texto || "(veja as fotos)"}`;
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
