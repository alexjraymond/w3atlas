-- Row-level-security tests. Run with scripts/test-db.sh. Any failed check raises an error.
\set ON_ERROR_STOP on
create or replace function pg_temp.expect_error(stmt text, label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    return;
  end;
  raise exception 'FAIL: expected an error: %', label;
end $$;
create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FAIL: %', label; end if;
  raise notice 'ok - %', label;
end $$;

-- two users; profiles are created by the sign-up trigger from provider metadata
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com', '{"preferred_username":"Alice","avatar_url":"https://x/a.png"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com', '{"full_name":"Bob"}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@example.com', '{"custom_claims":{"global_name":"Cara"},"full_name":"cara#1"}');
select pg_temp.check((select username from profiles where id = '00000000-0000-0000-0000-00000000000a') = 'Alice', 'twitch-style username');
select pg_temp.check((select username from profiles where id = '00000000-0000-0000-0000-00000000000b') = 'Bob', 'google-style username');
select pg_temp.check((select username from profiles where id = '00000000-0000-0000-0000-00000000000c') = 'Cara', 'discord display name preferred');

-- ---- as Alice: create a private and a public route ----
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into builds (id, title, race, data, is_public) values ('10000000-0000-0000-0000-000000000001', 'AM build', 'human', '{}', false);
insert into routes (id, title, map_id, race, data, is_public, build_id) values
  ('20000000-0000-0000-0000-000000000001', 'private route', 'autumn_leaves', 'human', '{}', false, null),
  ('20000000-0000-0000-0000-000000000002', 'public route', 'autumn_leaves', 'human', '{}', true, '10000000-0000-0000-0000-000000000001');
select pg_temp.check((select count(*) from routes) = 2, 'owner sees both of their routes');
select pg_temp.check((select owner_id from routes where id = '20000000-0000-0000-0000-000000000001') = '00000000-0000-0000-0000-00000000000a', 'owner_id defaults to the signed-in user');
update routes set rating_avg = 5, rating_count = 99 where id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select rating_avg = 0 and rating_count = 0 from routes where id = '20000000-0000-0000-0000-000000000002'), 'clients cannot write rating_avg / rating_count');
insert into routes (id, map_id, data, rating_avg) values ('20000000-0000-0000-0000-000000000009', 'x', '{}', 5);
select pg_temp.check((select rating_avg = 0 from routes where id = '20000000-0000-0000-0000-000000000009'), 'clients cannot insert a rating_avg');
delete from routes where id = '20000000-0000-0000-0000-000000000009';
select pg_temp.expect_error($$insert into route_ratings (route_id, stars) values ('20000000-0000-0000-0000-000000000002', 5)$$, 'cannot rate your own route');

-- ---- as Bob ----
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select pg_temp.check((select count(*) from routes) = 1, 'others only see public routes');
select pg_temp.check((select count(*) from builds) = 1, 'companion build of a public route is readable');
update routes set title = 'hacked' where id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select title from routes where id = '20000000-0000-0000-0000-000000000002') = 'public route', 'others cannot edit a route');
delete from routes where id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select count(*) from routes where id = '20000000-0000-0000-0000-000000000002') = 1, 'others cannot delete a route');
select pg_temp.expect_error($$insert into routes (owner_id, map_id, data) values ('00000000-0000-0000-0000-00000000000a', 'x', '{}')$$, 'cannot create a route as someone else');
select pg_temp.expect_error($$insert into route_ratings (route_id, stars) values ('20000000-0000-0000-0000-000000000001', 4)$$, 'cannot rate a private route');
select pg_temp.expect_error($$insert into route_ratings (route_id, stars) values ('20000000-0000-0000-0000-000000000002', 6)$$, 'stars must be 1-5');
insert into route_ratings (route_id, stars) values ('20000000-0000-0000-0000-000000000002', 4);
insert into route_comments (route_id, body) values ('20000000-0000-0000-0000-000000000002', 'nice route');
select pg_temp.expect_error($$insert into route_comments (route_id, body) values ('20000000-0000-0000-0000-000000000001', 'sneaky')$$, 'cannot comment on a private route');
select pg_temp.expect_error($$insert into route_comments (route_id, body) values ('20000000-0000-0000-0000-000000000002', '   ')$$, 'empty comments are rejected');

-- ---- as Cara ----
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
insert into route_ratings (route_id, stars) values ('20000000-0000-0000-0000-000000000002', 2);
select pg_temp.check((select rating_avg = 3.00 and rating_count = 2 and comment_count = 1 from routes where id = '20000000-0000-0000-0000-000000000002'), 'rating average and counts are maintained');
update route_ratings set stars = 5 where route_id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select rating_avg = 4.50 from routes where id = '20000000-0000-0000-0000-000000000002'), 'changing a rating updates the average');
delete from route_comments where route_id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select comment_count = 1 from routes where id = '20000000-0000-0000-0000-000000000002'), 'cannot delete someone else''s comment');

-- ---- back as Alice: route owner can moderate comments; ratings don't count as edits ----
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select pg_temp.check((select updated_at = created_at from routes where id = '20000000-0000-0000-0000-000000000002'), 'ratings and comments do not bump updated_at');
update routes set data = '{"steps":[]}' where id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select updated_at > created_at from routes where id = '20000000-0000-0000-0000-000000000002'), 'editing a route bumps updated_at');
delete from route_comments where route_id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check((select comment_count = 0 from routes where id = '20000000-0000-0000-0000-000000000002'), 'route owner can delete comments on their route');

-- ---- signed out (anon) ----
reset request.jwt.claim.sub;
set role anon;
select pg_temp.check((select count(*) from routes) = 1, 'signed-out visitors see public routes');
select pg_temp.check((select count(*) from route_ratings) = 2, 'signed-out visitors see ratings of public routes');
select pg_temp.expect_error($$insert into routes (map_id, data) values ('x', '{}')$$, 'signed-out visitors cannot create routes');

-- ---- unpublishing hides everything again ----
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
update routes set is_public = false where id = '20000000-0000-0000-0000-000000000002';
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select pg_temp.check((select count(*) from routes) = 0, 'unpublished routes disappear for others');
select pg_temp.check((select count(*) from builds) = 0, 'and so does their private companion build');
reset role;
\echo ALL POLICY TESTS PASSED
