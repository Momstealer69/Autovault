import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
async function signature(secret:string,body:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body))),b=>b.toString(16).padStart(2,'0')).join('')}
Deno.serve(async req=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 const raw=await req.text();const sent=req.headers.get('x-razorpay-signature')??'';const secret=Deno.env.get('RAZORPAY_WEBHOOK_SECRET');if(!secret||await signature(secret,raw)!==sent)return new Response('Invalid signature',{status:401});
 try{
  const event=JSON.parse(raw);const entity=event.payload?.payment?.entity;if(!entity)return new Response('Ignored',{status:200});
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:p}=await admin.from('payments').select('id,booking_id,amount').eq('razorpay_order_id',entity.order_id).single();if(!p)return new Response('Order not found',{status:404});
  if(entity.currency!=='INR'||entity.amount!==Math.round(Number(p.amount)*100))return new Response('Amount mismatch',{status:400});
  if(event.event==='payment.captured'){
   await admin.from('payments').update({razorpay_payment_id:entity.id,status:'captured'}).eq('id',p.id).neq('status','captured');
   await admin.from('bookings').update({status:'confirmed',payment_status:'paid',hold_expires_at:null}).eq('id',p.booking_id).eq('status','pending_payment');
  }else if(event.event==='payment.failed'){
   await admin.from('payments').update({razorpay_payment_id:entity.id,status:'failed'}).eq('id',p.id).neq('status','captured');
   await admin.from('bookings').update({payment_status:'failed'}).eq('id',p.booking_id).eq('status','pending_payment');
  }
  return new Response('ok',{status:200});
 }catch{return new Response('Invalid payload',{status:400})}
});
