import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
export const lerLinkCardapio=createServerFn({method:'POST'}).inputValidator((i:unknown)=>z.object({link:z.string().url().max(2000)}).parse(i)).handler(async({data})=>{
  const {lerLink,pareceCardapio}=await import('./link.server');
  const texto=await lerLink(data.link);
  return pareceCardapio(texto)?{ok:true as const,texto}:{ok:false as const,texto:''};
});
