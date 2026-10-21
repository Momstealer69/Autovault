import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
const hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('')
async function hmac(secret:string,value:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const auth=req.headers.get('Authorization');if(!auth)return Response.json({error:'Unauthorized'},{status:401,headers:cors});
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});const {data:{user}}=await db.auth.getUser();if(!user)return Response.json({error:'Unauthorized'},{status:401,headers:cors});
  const {booking_id,razorpay_order_id,razorpay_payment_id,razorpay_signature}=await req.json();
  if(![booking_id,razorpay_order_id,razorpay_payment_id,razorpay_signature].every(x=>typeof x==='string'))return Response.json({error:'Invalid payment details'},{status:400,headers:cors});
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);const {data:b}=await admin.from('bookings').select('id,customer_id,total_amount,status,hold_expires_at').eq('id',booking_id).single();
  const {data:p}=await admin.from('payments').select('id,razorpay_order_id,amount,status').eq('booking_id',booking_id).eq('razorpay_order_id',razorpay_order_id).single();
  if(!b||b.customer_id!==user.id||!p)return Response.json({error:'Payment or booking not found'},{status:404,headers:cors});
  if(b.status!=='pending_payment'||!b.hold_expires_at||Date.parse(b.hold_expires_at)<Date.now()||Number(p.amount)!==Number(b.total_amount))return Response.json({error:'Booking is no longer payable'},{status:409,headers:cors});
  const secret=Deno.env.get('RAZORPAY_KEY_SECRET')!;const expected=await hmac(secret,`${razorpay_order_id}|${razorpay_payment_id}`);if(expected!==razorpay_signature)return Response.json({error:'Invalid payment signature'},{status:400,headers:cors});
  const keyId=Deno.env.get('RAZORPAY_KEY_ID')!;const api=await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,{headers:{Authorization:`Basic ${btoa(`${keyId}:${secret}`)}`}});const payment=await api.json();
  if(!api.ok||payment.order_id!==razorpay_order_id||payment.currency!=='INR'||payment.amount!==Math.round(Number(b.total_amount)*100)||payment.status!=='captured')return Response.json({status:payment.status??'pending',message:'Payment has not been captured yet.'},{status:202,headers:cors});
  const {error}=await admin.from('payments').update({razorpay_payment_id,status:'captured'}).eq('id',p.id).neq('status','captured');if(error)return Response.json({error:'Could not record payment'},{status:500,headers:cors});
  await admin.from('bookings').update({status:'confirmed',payment_status:'paid',hold_expires_at:null}).eq('id',booking_id).eq('status','pending_payment');
  return Response.json({status:'confirmed',booking_id},{headers:cors});
 }catch{return Response.json({error:'Invalid request'},{status:400,headers:cors})}
});
