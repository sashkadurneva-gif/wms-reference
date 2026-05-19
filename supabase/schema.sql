create table if not exists public.articles (
  id text primary key,
  section text not null,
  title text not null,
  content text not null,
  keywords text[] not null default '{}',
  source_raw text not null default '',
  template_version integer not null default 2,
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;

create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Articles are readable by everyone" on public.articles;

create policy "Articles are readable by everyone"
on public.articles
for select
to anon
using (true);
