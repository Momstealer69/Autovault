create extension if not exists pgcrypto;
create type public.app_role as enum ('customer','business','admin');
create type public.verification_state as enum ('pending','verified','rejected','suspended');
create type public.booking_state as enum ('pending_payment','confirmed','in_progress','completed','cancelled','expired');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, full_name text not null default '', email text, phone text,
 avatar_url text, role public.app_role not null default 'customer', city text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.businesses (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 business_name text not null, description text not null default '', category text not null, phone text, email text,
 address text not null, city text not null, state text not null, pincode text not null, latitude numeric(9,6), longitude numeric(9,6),
 verification_status public.verification_state not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vehicles (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 make text not null, model text not null, variant text, year int check(year between 1950 and 2100), fuel_type text, transmission text,
 registration_number text, current_mileage int check(current_mileage is null or current_mileage>=0), purchase_date date, vehicle_image text,
 created_at timestamptz not null default now()
);
create unique index vehicles_owner_registration_uq on public.vehicles(owner_id, upper(registration_number)) where registration_number is not null and registration_number<>'';
create table public.business_working_hours (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, day_of_week int not null check(day_of_week between 0 and 6), is_open boolean not null default false, opening_time time, closing_time time, unique(business_id,day_of_week));
create table public.business_booking_settings (business_id uuid primary key references public.businesses on delete cascade, booking_enabled boolean not null default false, slot_duration_minutes int not null default 30 check(slot_duration_minutes between 5 and 480), minimum_notice_minutes int not null default 60, maximum_advance_days int not null default 30, buffer_before_minutes int not null default 0, buffer_after_minutes int not null default 0, max_concurrent_bookings int not null default 1 check(max_concurrent_bookings>0));
create table public.business_services (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, service_name text not null, description text not null default '', category text not null, starting_price numeric(12,2) not null check(starting_price>=0), duration_minutes int not null check(duration_minutes>0), active boolean not null default false);
create table public.service_packages (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.business_services on delete cascade, package_name text not null, description text not null default '', price numeric(12,2) not null check(price>=0), duration_minutes int not null check(duration_minutes>0), inclusions jsonb not null default '[]', warranty text, active boolean not null default false);
create table public.service_availability (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.business_services on delete cascade, day_of_week int not null check(day_of_week between 0 and 6), is_available boolean not null default true, start_time time not null, end_time time not null, check(end_time>start_time), unique(service_id,day_of_week));
create table public.business_blocked_dates (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, blocked_date date not null, start_time time, end_time time, reason text, check((start_time is null and end_time is null) or end_time>start_time));
create table public.service_resources (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, name text not null, resource_type text not null, capacity int not null default 1 check(capacity>0), is_active boolean not null default true);
create table public.service_resource_requirements (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.business_services on delete cascade, resource_id uuid not null references public.service_resources on delete cascade, quantity int not null default 1 check(quantity>0), unique(service_id,resource_id));
create table public.bookings (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), business_id uuid not null references public.businesses(id), vehicle_id uuid not null references public.vehicles(id), service_id uuid not null references public.business_services(id), package_id uuid references public.service_packages(id),
 start_at timestamptz not null, end_at timestamptz not null, status public.booking_state not null default 'pending_payment', subtotal numeric(12,2) not null check(subtotal>=0), discount numeric(12,2) not null default 0 check(discount>=0), tax numeric(12,2) not null default 0 check(tax>=0), total_amount numeric(12,2) not null check(total_amount>=0), payment_status text not null default 'pending' check(payment_status in ('pending','authorized','paid','failed','refunded')), hold_expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(end_at>start_at), check(total_amount=subtotal-discount+tax)
);
create table public.booking_resources (id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade, resource_id uuid not null references public.service_resources, start_at timestamptz not null, end_at timestamptz not null, check(end_at>start_at), unique(booking_id,resource_id));
create index bookings_business_time on public.bookings(business_id,start_at,end_at) where status in ('pending_payment','confirmed','in_progress');
create index bookings_customer_recent on public.bookings(customer_id,created_at desc);
create table public.payments (id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade, user_id uuid not null references auth.users, razorpay_order_id text unique, razorpay_payment_id text unique, amount numeric(12,2) not null check(amount>=0), currency text not null default 'INR' check(currency='INR'), status text not null check(status in ('created','authorized','captured','failed','refunded')), created_at timestamptz not null default now());
create unique index payments_one_open_order_per_booking on public.payments(booking_id) where status in ('created','authorized');
create table public.maintenance_records (id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles on delete cascade, service_name text not null, service_date date not null, mileage int, amount numeric(12,2) check(amount is null or amount>=0), business_id uuid references public.businesses, notes text, invoice_url text);
create table public.vehicle_documents (id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles on delete cascade, document_type text not null, document_number text, issue_date date, expiry_date date, file_url text not null);
create table public.vehicle_expenses (id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles on delete cascade, category text not null, amount numeric(12,2) not null check(amount>=0), expense_date date not null, description text);
create table public.offers (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, title text not null, description text not null default '', discount_type text not null check(discount_type in ('percent','fixed')), discount_value numeric(12,2) not null check(discount_value>0), coupon_code text, start_date timestamptz not null, end_date timestamptz not null, active boolean not null default false, check(end_date>start_date));
create table public.favorites (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, business_id uuid not null references public.businesses on delete cascade, created_at timestamptz not null default now(), unique(user_id,business_id));
create table public.reviews (id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users, business_id uuid not null references public.businesses, booking_id uuid not null unique references public.bookings, rating int not null check(rating between 1 and 5), review_text text not null default '', service_quality int check(service_quality between 1 and 5), value_rating int check(value_rating between 1 and 5), staff_rating int check(staff_rating between 1 and 5), verified boolean not null default false, created_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, title text not null, message text not null, type text not null, read boolean not null default false, created_at timestamptz not null default now());
create table public.business_subscriptions (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, plan text not null check(plan in ('starter','professional','enterprise')), status text not null, start_date timestamptz, renewal_date timestamptz, razorpay_subscription_id text unique);

-- Role is assigned only by trusted application administration; self-edit policy omits role.
alter table public.profiles enable row level security;
create policy "profiles read self" on public.profiles for select using (id=auth.uid());
create policy "profiles update self" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name,email,phone,avatar_url,city,updated_at) on public.profiles to authenticated;
alter table public.profiles force row level security;
do $$ declare t text; begin
 foreach t in array array['businesses','vehicles','business_working_hours','business_booking_settings','business_services','service_packages','service_availability','business_blocked_dates','service_resources','service_resource_requirements','bookings','booking_resources','payments','maintenance_records','vehicle_documents','vehicle_expenses','offers','favorites','reviews','notifications','business_subscriptions'] loop
  execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;
create policy "public verified businesses" on public.businesses for select using (verification_status='verified');
create policy "owner reads own business" on public.businesses for select using (owner_id=auth.uid());
create policy "owner creates pending business" on public.businesses for insert with check (owner_id=auth.uid() and verification_status='pending');
create policy "owner updates own business" on public.businesses for update using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "owner deletes own business" on public.businesses for delete using (owner_id=auth.uid() and verification_status='pending');
revoke update on public.businesses from authenticated;
grant update (business_name,description,category,phone,email,address,city,state,pincode,latitude,longitude,updated_at) on public.businesses to authenticated;
create policy "business owner hours" on public.business_working_hours for all using (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "booking settings owner" on public.business_booking_settings for all using (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "public active services" on public.business_services for select using (active and exists(select 1 from public.businesses b where b.id=business_id and b.verification_status='verified'));
create policy "owners manage services" on public.business_services for all using (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check (exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "public packages" on public.service_packages for select using (active and exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and s.active and b.verification_status='verified'));
create policy "service owners packages" on public.service_packages for all using (exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid())) with check (exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid()));
create policy "availability public read" on public.service_availability for select using(exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and s.active and b.verification_status='verified'));
create policy "availability owner manage" on public.service_availability for all using(exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid()));
create policy "blocked dates owner" on public.business_blocked_dates for all using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "resources owner" on public.service_resources for all using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "resource requirements owner" on public.service_resource_requirements for all using(exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.business_services s join public.businesses b on b.id=s.business_id where s.id=service_id and b.owner_id=auth.uid()));
create policy "booking resource participants" on public.booking_resources for select using(exists(select 1 from public.bookings b where b.id=booking_id and (b.customer_id=auth.uid() or exists(select 1 from public.businesses bs where bs.id=b.business_id and bs.owner_id=auth.uid()))));
create policy "customer manages vehicles" on public.vehicles for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "booking participants read" on public.bookings for select using(customer_id=auth.uid() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
revoke insert, update on public.bookings from authenticated;
grant update (status) on public.bookings to authenticated;
create policy "customers cancel own booking" on public.bookings for update using(customer_id=auth.uid() and status in ('pending_payment','confirmed')) with check(customer_id=auth.uid() and status='cancelled');
create policy "business updates own booking" on public.bookings for update using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "payment owner read" on public.payments for select using(user_id=auth.uid());
create policy "vehicle child owner access" on public.maintenance_records for all using(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid())) with check(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid()));
create policy "private documents owner" on public.vehicle_documents for all using(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid())) with check(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid()));
create policy "expenses owner" on public.vehicle_expenses for all using(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid())) with check(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid()));
create policy "public current offers" on public.offers for select using(active and now() between start_date and end_date);
create policy "offer owner manage" on public.offers for all using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "favorites owner" on public.favorites for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "reviews public read" on public.reviews for select using(verified);
create policy "customer review own completed booking" on public.reviews for insert with check(customer_id=auth.uid() and verified=false and exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid() and b.business_id=business_id and b.status='completed'));
revoke update on public.reviews from authenticated;
grant update (review_text,rating,service_quality,value_rating,staff_rating) on public.reviews to authenticated;
create policy "notifications owner" on public.notifications for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "subscription owner read" on public.business_subscriptions for select using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

-- Prevent concurrent purchases of overlapping capacity at the same business.
create function public.reserve_booking(p_business_id uuid,p_vehicle_id uuid,p_service_id uuid,p_package_id uuid,p_start_at timestamptz,p_end_at timestamptz)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_price numeric(12,2); v_booking uuid; v_owner uuid; v_enabled boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_business_id::text,0));
 select owner_id into v_owner from public.vehicles where id=p_vehicle_id;
 if v_owner is distinct from auth.uid() then raise exception 'Vehicle access denied'; end if;
 select coalesce(s.booking_enabled,false) into v_enabled from public.business_booking_settings s where s.business_id=p_business_id;
 if not coalesce(v_enabled,false) then raise exception 'Online booking is unavailable'; end if;
 select p.price into v_price from public.service_packages p join public.business_services s on s.id=p.service_id
 where p.id=p_package_id and p.service_id=p_service_id and s.business_id=p_business_id and p.active and s.active;
 if v_price is null then raise exception 'Service package unavailable'; end if;
 if exists(select 1 from public.bookings b where b.business_id=p_business_id and b.status in ('pending_payment','confirmed','in_progress') and (b.hold_expires_at is null or b.hold_expires_at>now()) and b.start_at<p_end_at and b.end_at>p_start_at) then raise exception 'Time slot no longer available'; end if;
 insert into public.bookings(customer_id,business_id,vehicle_id,service_id,package_id,start_at,end_at,subtotal,total_amount,hold_expires_at)
 values(auth.uid(),p_business_id,p_vehicle_id,p_service_id,p_package_id,p_start_at,p_end_at,v_price,v_price,now()+interval '10 minutes') returning id into v_booking;
 return v_booking;
end $$;
revoke all on function public.reserve_booking(uuid,uuid,uuid,uuid,timestamptz,timestamptz) from public, anon;
grant execute on function public.reserve_booking(uuid,uuid,uuid,uuid,timestamptz,timestamptz) to authenticated;

-- Private buckets: documents/invoices are addressed by owner UUID prefix.
insert into storage.buckets(id,name,public) values ('vehicle-private','vehicle-private',false),('business-media','business-media',false) on conflict(id) do nothing;
create policy "owner private file access" on storage.objects for all to authenticated using(bucket_id='vehicle-private' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='vehicle-private' and (storage.foldername(name))[1]=auth.uid()::text);
