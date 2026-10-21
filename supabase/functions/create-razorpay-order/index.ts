import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' }
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const auth=req.headers.get('Authorization'); if(!auth)return reply({error:'Unauthorized'},401);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await db.auth.getUser(); if(userError||!user)return reply({error:'Unauthorized'},401);
  const {booking_id}=await req.json(); if(typeof booking_id!=='string')return reply({error:'booking_id required'},400);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:b,error}=await admin.from('bookings').select('id,customer_id,total_amount,payment_status,status,hold_expires_at').eq('id',booking_id).single();
  if(error||!b||b.customer_id!==user.id)return reply({error:'Booking not found'},404);
  if(b.status!=='pending_payment'||b.payment_status!=='pending'||!b.hold_expires_at||Date.parse(b.hold_expires_at)<Date.now())return reply({error:'Booking hold expired or is not payable'},409);
  const amount=Math.round(Number(b.total_amount)*100); if(!Number.isSafeInteger(amount)||amount<100)return reply({error:'Invalid booking amount'},400);
  const keyId=Deno.env.get('RAZORPAY_KEY_ID'),keySecret=Deno.env.get('RAZORPAY_KEY_SECRET'); if(!keyId||!keySecret)return reply({error:'Razorpay is not configured'},503);
  const {data:existing}=await admin.from('payments').select('razorpay_order_id,status').eq('booking_id',booking_id).in('status',['created','authorized']).maybeSingle();
  if(existing?.razorpay_order_id){const orderResponse=await fetch(`https://api.razorpay.com/v1/orders/${existing.razorpay_order_id}`,{headers:{Authorization:`Basic ${btoa(`${keyId}:${keySecret}`)}`}});const existingOrder=await orderResponse.json();if(orderResponse.ok&&existingOrder.status==='created'&&existingOrder.amount===amount)return reply({order_id:existingOrder.id,amount:existingOrder.amount,currency:'INR',key_id:keyId});}
  const response=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:`Basic ${btoa(`${keyId}:${keySecret}`)}`,'Content-Type':'application/json'},body:JSON.stringify({amount,currency:'INR',receipt:booking_id,notes:{booking_id,user_id:user.id}})});
  const order=await response.json(); if(!response.ok)return reply({error:'Razorpay order creation failed'},502);
  const {error:saveError}=await admin.from('payments').insert({booking_id,user_id:user.id,razorpay_order_id:order.id,amount:Number(b.total_amount),currency:'INR',status:'created'});
  if(saveError)return reply({error:'Could not record payment order. Retry to reuse any active order.'},409);
  return reply({order_id:order.id,amount:order.amount,currency:'INR',key_id:keyId});
 }catch{return reply({error:'Invalid request'},400)}
});
