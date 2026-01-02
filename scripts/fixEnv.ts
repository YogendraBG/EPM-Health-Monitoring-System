
import * as fs from 'fs'
import * as path from 'path'

const envContent = `AUTH_SECRET="f6929a007f903780360a8b983f4f7839"
AUTH_URL="http://localhost:3500"

# Database (Supabase Cloud)
DATABASE_URL="postgresql://postgres.abbafygiugskitmqgncy:J%40nF1rst@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:J%40nF1rst@db.abbafygiugskitmqgncy.supabase.co:5432/postgres"

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL="https://abbafygiugskitmqgncy.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_9aNIlfDN_yYoMCkAhILbwA_1UajQS4l"
`

const envPath = path.join(process.cwd(), '.env')

try {
    // Use 'utf8' explicitly and ensure NO BOM (Node.js does this by default)
    // We trim to remove any accidental leading/trailing whitespace
    fs.writeFileSync(envPath, envContent.trim() + '\n', { encoding: 'utf8' })
    console.log('Successfully wrote clean .env file!')
} catch (err: any) {
    console.error('Failed to write .env file:', err.message)
    process.exit(1)
}
