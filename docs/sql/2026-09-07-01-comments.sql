-- Comments on lessons, tests and test attempts, with one optional attachment.
--
-- Run this in the Supabase SQL editor before 2026-09-07-02-comment-files.sql.
-- Re-runnable: every statement is guarded.
--
-- A comment points at exactly one target:
--   lesson_id  -- thread under a lesson, visible to everyone who can read it
--   test_id    -- thread under a test, visible to the teacher and to students
--                 who already submitted an attempt (so answers cannot leak to
--                 students who have not taken the test yet)
--   attempt_id -- private thread on one attempt: that student and the test author

create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),
    author_id uuid not null references auth.users (id) on delete cascade,

    lesson_id uuid references public.lessons (id) on delete cascade,
    test_id uuid references public.tests (id) on delete cascade,
    attempt_id uuid references public.attempts (id) on delete cascade,

    body text not null default '',

    -- The attachment lives in the private storage bucket "comment-files";
    -- file_path is the object path inside it, never a public url.
    file_path text,
    file_name text,
    file_size integer,
    file_type text,

    created_at timestamptz not null default now(),

    constraint comments_one_target
        check (num_nonnulls(lesson_id, test_id, attempt_id) = 1),

    -- A comment carries a full attachment or none at all, never half of one.
    constraint comments_file_all_or_none
        check (num_nonnulls(file_path, file_name, file_size, file_type) in (0, 4)),

    constraint comments_body_length
        check (char_length(body) <= 2000),

    -- Text is optional only when a file is attached.
    constraint comments_not_empty
        check (char_length(btrim(body)) > 0 or file_path is not null),

    -- The bucket enforces the same 10 MB cap; this keeps the stored number honest.
    constraint comments_file_size
        check (file_size is null or (file_size > 0 and file_size <= 10485760))
);

-- One index per thread lookup: the page reads a single target ordered by time.
-- Partial, because each row sets exactly one of the three columns.
create index if not exists comments_lesson_created_at_idx
    on public.comments (lesson_id, created_at) where lesson_id is not null;

create index if not exists comments_test_created_at_idx
    on public.comments (test_id, created_at) where test_id is not null;

create index if not exists comments_attempt_created_at_idx
    on public.comments (attempt_id, created_at) where attempt_id is not null;

-- Used by the delete policy below.
create index if not exists comments_author_id_idx
    on public.comments (author_id);

alter table public.comments enable row level security;

grant select, insert, delete on public.comments to authenticated;

-- Read: whoever may read the target may read its thread.
drop policy if exists sprout_comments_select on public.comments;

create policy sprout_comments_select
on public.comments
for select
to authenticated
using (
    (
        lesson_id is not null
        and exists (
            select 1 from public.lessons l
            where l.id = comments.lesson_id
              and (l.published or l.author_id = (select auth.uid()))
        )
    )
    or (
        test_id is not null
        and exists (
            select 1 from public.tests t
            where t.id = comments.test_id
              and (t.published or t.author_id = (select auth.uid()))
        )
        and (
            exists (
                select 1 from public.profiles p
                where p.id = (select auth.uid()) and p.role = 'teacher'
            )
            or exists (
                select 1 from public.attempts a
                where a.test_id = comments.test_id
                  and a.student_id = (select auth.uid())
            )
        )
    )
    or (
        attempt_id is not null
        and exists (
            select 1
            from public.attempts a
            join public.tests t on t.id = a.test_id
            where a.id = comments.attempt_id
              and (a.student_id = (select auth.uid()) or t.author_id = (select auth.uid()))
        )
    )
);

-- Write: you may write where you may read, and only as yourself.
drop policy if exists sprout_comments_insert_own on public.comments;

create policy sprout_comments_insert_own
on public.comments
for insert
to authenticated
with check (
    author_id = (select auth.uid())
    and (
        (
            lesson_id is not null
            and exists (
                select 1 from public.lessons l
                where l.id = comments.lesson_id
                  and (l.published or l.author_id = (select auth.uid()))
            )
        )
        or (
            test_id is not null
            and exists (
                select 1 from public.tests t
                where t.id = comments.test_id
                  and (t.published or t.author_id = (select auth.uid()))
            )
            and (
                exists (
                    select 1 from public.profiles p
                    where p.id = (select auth.uid()) and p.role = 'teacher'
                )
                or exists (
                    select 1 from public.attempts a
                    where a.test_id = comments.test_id
                      and a.student_id = (select auth.uid())
                )
            )
        )
        or (
            attempt_id is not null
            and exists (
                select 1
                from public.attempts a
                join public.tests t on t.id = a.test_id
                where a.id = comments.attempt_id
                  and (a.student_id = (select auth.uid()) or t.author_id = (select auth.uid()))
            )
        )
    )
);

-- Delete: your own comment, or any comment if you are a teacher (moderation).
-- There is no update policy on purpose: comments are not editable.
drop policy if exists sprout_comments_delete on public.comments;

create policy sprout_comments_delete
on public.comments
for delete
to authenticated
using (
    author_id = (select auth.uid())
    or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.role = 'teacher'
    )
);
