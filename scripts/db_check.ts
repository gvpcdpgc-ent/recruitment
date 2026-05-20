import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: forms, error } = await supabase.from('position_forms').select('*');
  console.log("Forms Count:", forms?.length);
  if (forms?.length === 0) {
      console.log("NO FORMS FOUND.");
  } else {
      console.dir(forms, {depth: null});
  }
  
  if (error) {
     console.log("Error querying position_forms:", error);
  }

  const { data: positions, error: pErr } = await supabase.from('positions').select('id, title');
  console.log("Positions:", positions);
}

check();
