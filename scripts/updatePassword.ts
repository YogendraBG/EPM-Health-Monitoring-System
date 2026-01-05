
import * as fs from 'fs'

const encodedPassword = encodeURIComponent("Supabase Password"); // "Supabase%20Password"

const envContent = `AUTH_SECRET=f6929a007f903780360a8b983f4f7839
AUTH_URL=http://localhost:3500
DATABASE_URL=postgresql://postgres.abbafygiugskitmqgncy:${encodedPassword}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:${encodedPassword}@db.abbafygiugskitmqgncy.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://abbafygiugskitmqgncy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_9aNIlfDN_yYoMCkAhILbwA_1UajQS4l
`

fs.writeFileSync('.env', envContent.trim(), 'utf8')
console.log('Local .env updated with new password (encoded).')
console.log('DATABASE_URL:', `postgresql://postgres.abbafygiugskitmqgncy:${encodedPassword}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`)
