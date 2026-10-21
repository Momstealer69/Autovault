import { supabase } from '../lib/supabase'
export type Business = { id:string; business_name:string; category:string; city:string; address:string; verification_status:string; description:string; phone?:string; rating?:number; starting_price?:number }
export async function getBusinesses() {
  if (!supabase) return { data: [] as Business[], error: 'Connect Supabase to load live listings.' }
  const { data, error } = await supabase.from('businesses').select('id,business_name,category,city,address,verification_status,description,phone,business_services(starting_price)').eq('verification_status','verified').order('business_name').limit(24)
  type Row = Business & { business_services?: { starting_price: number }[] }
  const rows = (data ?? []) as unknown as Row[]
  return { data: rows.map(({business_services,...b})=>({...b,starting_price:business_services?.length?Math.min(...business_services.map(s=>s.starting_price)):undefined})), error: error?.message ?? null }
}
export async function getMyVehicles() {
  if (!supabase) return { data: [], error: 'Connect Supabase to use your garage.' }
  const { data, error } = await supabase.from('vehicles').select('*').order('created_at',{ascending:false})
  return { data: data ?? [], error: error?.message ?? null }
}
export async function addVehicle(vehicle: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sign in to add a vehicle.')
  const { error } = await supabase.from('vehicles').insert({ ...vehicle, owner_id:user.id })
  if (error) throw error
}
