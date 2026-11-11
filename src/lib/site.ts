// Substitua por seu endereço completo do LinkedIn quando estiver disponível.
export const LINKEDIN_URL = '';
export const ABOUT = 'O Cardápio Turbo foi criado por Lana, estudante de Administração da UFES, para ajudar hamburguerias de delivery a melhorar seus cardápios com IA. A análise é gratuita. As sugestões são pontos que podem ajudar, não garantia de vendas. Dados de contato só são guardados com consentimento e nunca são publicados.';
export function pageHead(title:string,description:string){return {meta:[{title:`${title} — Cardápio Turbo`},{name:'description',content:description},{property:'og:title',content:`${title} — Cardápio Turbo`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
