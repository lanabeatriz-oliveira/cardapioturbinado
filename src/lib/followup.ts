export function followupDate(created:string,days:number){const d=new Date(created);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function contactFields(consent:boolean,owner:string,phone:string){return {nome_dono:consent?owner.trim()||null:null,whatsapp:consent?phone.replace(/\D/g,'')||null:null};}
export function whatsappLink(a:{nome_dono:string|null;nome_hamburgueria:string|null;whatsapp:string|null;criado_em:string|null;token:string|null},origin:string,now=new Date()){
 if(!a.whatsapp||!a.token)return null; const days=Math.max(0,Math.floor((now.getTime()-new Date(a.criado_em||now).getTime())/86400000));let phone=a.whatsapp.replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;
 const message=`Oi, ${a.nome_dono||'tudo bem'}! Aqui é a Lana do Cardápio Turbo. Já faz ${days} dias da análise do cardápio da ${a.nome_hamburgueria||'sua hamburgueria'}. Pode me contar em 1 minuto como foi? ${origin}/retorno/${a.token}`;
 return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
