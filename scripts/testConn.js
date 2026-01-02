
const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres.abbafygiugskitmqgncy:J%40nF1rst@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await client.connect();
        console.log('Successfully connected to Supabase!');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time from DB:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

test();
