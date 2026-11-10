import type { Resultado } from "./analyze.functions";

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");
const reais = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function calcularNumeros(r: Resultado) {
  const n = r.numeros;
  if (!n) return [];
  return [
    { valor: String(n.totalItens), rotulo: "itens no cardápio" },
    { valor: pct(n.itensComDescricao, n.totalItens), rotulo: "itens com descrição" },
    { valor: pct(n.burgersComPeso, n.totalBurgers), rotulo: "burgers com peso informado" },
    { valor: String(n.combos), rotulo: "combos" },
    { valor: String(n.adicionais), rotulo: "adicionais" },
    { valor: String(n.incoerenciasPreco), rotulo: "incoerências de preço" },
    { valor: reais(n.menorPrecoBurger), rotulo: "burger mais barato" },
    { valor: reais(n.maiorPrecoBurger), rotulo: "burger mais caro" },
    { valor: reais(n.precoMedioBurger), rotulo: "preço médio dos burgers" },
  ];
}
