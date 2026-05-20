import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim().replace(/"/g, '');
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/position_forms?select=*';
const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

async function run() {
  if (!env['NEXT_PUBLIC_SUPABASE_URL']) {
     console.log("NO URL"); return;
  }
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log("position_forms table:");
  console.log(JSON.stringify(data, null, 2));

  const posRes = await fetch(env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/positions?select=id,title', {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const posData = await posRes.json();
  console.log("positions table:");
  console.log(JSON.stringify(posData, null, 2));
}

run();
