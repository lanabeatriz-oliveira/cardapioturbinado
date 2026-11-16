# Cardapioturbinado

Crie um app web em português do Brasil chamado "Cardápio Turbo": um otimizador de cardápio com IA para pequenos restaurantes de delivery.

FLUXO
1. Tela inicial: título, frase curta ("Descubra o que está fazendo seu cardápio perder pedidos") e um botão "Analisar meu cardápio".
2. Entrada: o usuário pode (a) enviar uma ou mais fotos do cardápio ou (b) colar o texto do cardápio. Campos opcionais: nome do restaurante e tipo de comida.
3. Processamento: use IA (Lovable AI) para ler o cardápio (incluindo texto em imagem) e analisá-lo. Mostre um loading com mensagens tipo "Lendo seu cardápio...".
4. Resultado, em cards:
   - Nota geral de 0 a 100.
   - Nota de 0 a 10 em 7 critérios, cada um com uma explicação curta e um exemplo tirado do próprio cardápio:
     1. Nome claro
     2. Descrição que dá vontade
     3. Informação de porção
     4. Coerência de preço
     5. Combos e adicionais
     6. Organização
     7. Destaques e erros
   - "Top 3 ações": as três mudanças de maior impacto, em linguagem simples para o dono do restaurante.
   - "Cardápio reescrito": cada item com antes e depois (nome e descrição), com botão de copiar.
   - Sugestões de 2 ou 3 combos montados com itens que já existem no cardápio.

REGRAS PARA A IA
- Nunca inventar ingredientes, preços ou itens que não estejam no cardápio. Se faltar informação, sugerir que o dono a acrescente (ex.: "informe o peso").
- Não alterar preços; só apontar incoerências.
- Tom: amigável, direto e sem jargão.
- Resposta em JSON estruturado, para a interface montar os cards.

DESIGN
- Mobile first, limpo e moderno, com cor de destaque vermelho/laranja quente e cards arredondados.
- Botão "Analisar outro cardápio" no fim.

Não precisa de login nesta versão.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cardapioturbinado.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ae3f990-f0cc-49ed-875d-ef527c1a25fc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
