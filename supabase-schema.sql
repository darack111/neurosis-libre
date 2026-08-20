-- Pegá todo este archivo en el SQL Editor de tu proyecto Supabase y ejecutalo una vez.

-- Tabla de perfiles: se crea sola cuando alguien se registra.
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  next_number integer default 1
);

alter table public.profiles enable row level security;

create policy "Cada usuario ve y edita solo su perfil"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cuando alguien se registra, le creamos su fila de perfil automáticamente.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabla de escritos (poesías, pensamientos, notas).
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  number integer,
  type text not null,
  title text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table public.entries enable row level security;

create policy "Cada usuario ve solo sus escritos"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea sus propios escritos"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario edita solo sus escritos"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Cada usuario borra solo sus escritos"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Le asigna automáticamente el número de archivo (001, 002...) a cada escrito nuevo,
-- de forma que nunca se repite ni se reordena aunque borres alguno.
create function public.set_entry_number()
returns trigger as $$
declare
  n integer;
begin
  update public.profiles set next_number = next_number + 1
  where id = new.user_id
  returning next_number - 1 into n;
  new.number := n;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger set_entry_number_trigger
  before insert on public.entries
  for each row execute procedure public.set_entry_number();
