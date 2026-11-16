#!/usr/bin/env bash
# Runs the Supabase migrations and row-level-security tests against a throwaway database on a
# local Postgres:  PGHOST=/tmp PGPORT=5432 PGUSER=postgres scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=w3atlas_test_$$
psql -q -d postgres -c "create database $DB" >/dev/null
trap 'psql -q -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/supabase_stub.sql >/dev/null
for f in supabase/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" >/dev/null; done
psql -q -v ON_ERROR_STOP=1 -o /dev/null -d "$DB" -f supabase/tests/policies.sql 2>&1 | sed -E 's/^psql:[^ ]+ (NOTICE|ERROR): +//'
exit "${PIPESTATUS[0]}"
