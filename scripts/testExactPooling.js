
const { Client } = require('pg');

async function test() {
    // Exact URL passed to user
    const url = "postgresql://postgres.abbafygiugskitmqgncy:J%40nF1rst@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    console.log('Testing pooling connection string with pg library...');

    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('SUCCESS!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('FAILED.');
        console.error(err.message);
    } finally {
        await client.end();
    }
}
test();
