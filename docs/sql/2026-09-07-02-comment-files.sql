-- Private storage bucket for comment attachments (one file per comment, max 10 MB).
--
-- Run this after 2026-09-07-01-comments.sql, in the Supabase SQL editor.
-- Re-runnable: the bucket upsert refreshes its limits, the policies are dropped first.
--
-- Object paths are "{user_id}/{uuid}.{ext}". The bucket is private: nothing is
-- ever served through a public url. The app reads an attachment by minting a
-- short-lived signed url with the service-role client, and only for comment rows
-- the reader's own RLS already let them select. That keeps one rule in one place
-- (the comments policies) instead of restating thread visibility here.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'comment-files',
    'comment-files',
    false,
    10485760, -- 10 MB, enforced by storage itself, so a hand-made request cannot beat it
    array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/webp'
    ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The browser uploads straight to storage under the user's own session, so the
-- 10 MB file never passes through the Next.js server. A user may only write
-- inside the folder named after their own id.
drop policy if exists sprout_comment_files_insert_own on storage.objects;

create policy sprout_comment_files_insert_own
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'comment-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Reading your own files directly. Everyone else reads through a signed url.
drop policy if exists sprout_comment_files_select_own on storage.objects;

create policy sprout_comment_files_select_own
on storage.objects
for select
to authenticated
using (
    bucket_id = 'comment-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Deleting your own comment deletes its file. It also lets the form clean up an
-- upload whose comment row failed to insert. A teacher deleting someone else's
-- comment removes the file with the service-role client instead.
drop policy if exists sprout_comment_files_delete_own on storage.objects;

create policy sprout_comment_files_delete_own
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'comment-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);
