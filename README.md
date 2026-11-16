# 🍔 Cardápio Turbo (piloto)

App com IA que analisa cardápios de hamburguerias de delivery e mostra o que está fazendo o restaurante perder pedidos.

**Acesse:** https://cardapioturbinado.lovable.app

## O problema
Hamburguerias pequenas vendem pelo cardápio do delivery, mas raramente têm tempo de revisá-lo. Analisando cardápios reais de Vitória-ES, encontrei lanche de 2 carnes com o preço do de 1, combo com desconto de R$ 0,01 e a mesma foto em 5 lanches diferentes.

## O que o app faz
- Lê o cardápio por prints (até 10), link ou texto
- Dá nota geral (0–100) e nota em 8 critérios: nome, descrição, porção, coerência de preço, combos e adicionais, organização, destaques e erros, fotos dos produtos
- Mostra um raio-x em números e as 3 ações de maior impacto
- Reescreve o cardápio e sugere combos com itens que já existem
- Compara com até 3 concorrentes
- Gera relatório em PDF
- Salva a análise (com consentimento LGPD) e faz o acompanhamento após 7 dias pelo WhatsApp

## Regras da IA
Nunca inventa itens, ingredientes ou preços. Não altera preços, só aponta incoerências. Nas fotos, avalia fidelidade ao produto.

## De onde vêm os critérios
Recomendações de plataformas de delivery: segundo dados do DoorDash (15 mil+ restaurantes, 2022), cardápios com foto tiveram até 44% mais vendas mensais e, com descrição, até 18% mais. Também: blogs de parceiros do iFood e a orientação do iFood sobre fotos fiéis ao produto.

## Tecnologias
Lovable · Google Gemini · Supabase · TypeScript/React

## Autora
Lana Beatriz Oliveira, Administração UFES · [LinkedIn](https://www.linkedin.com/in/lanabeatrizoliveira)
