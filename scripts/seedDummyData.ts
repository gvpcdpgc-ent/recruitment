// scripts/seedDummyData.ts
// Run this file using ts-node or similar environment executing TypeScript
// Example: npx ts-node scripts/seedDummyData.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateData() {
  console.log("Starting Dummy Data Generation...");

  // 1. Departments
  const { data: deptData, error: deptError } = await supabase.from('departments').insert([
    { name: 'Computer Science', code: 'CS' },
    { name: 'Mechanical Engineering', code: 'ME' }
  ]).select();

  if (deptError) {
    console.error("Error inserting departments:", deptError.message);
    return;
  }
  const csDept = deptData.find(d => d.code === 'CS');

  // 2. Positions
  const { data: posData, error: posError } = await supabase.from('positions').insert({
    title: 'Assistant Professor (AI/ML)',
    department_id: csDept.id,
    description: 'We are looking for exceptional talent in Artificial Intelligence and Machine Learning...',
    qualifications: '- PhD in Computer Science\n- Proven research track record',
    instructions: 'Please upload your latest CV and cover letter.',
    status: 'open',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  }).select().single();

  if (posError) {
    console.error("Error inserting position:", posError.message);
    return;
  }

  // 3. Dynamic Form for Position
  const { error: formError } = await supabase.from('position_forms').insert({
    position_id: posData.id,
    schema_json: [
       { id: 'field_1', type: 'Dropdown', label: 'Highest Degree', required: true, options: ['PhD', 'Masters'] },
       { id: 'field_2', type: 'Number', label: 'Years of Experience', required: true }
    ]
  });

  if (formError) {
    console.error("Error inserting form:", formError.message);
    return;
  }

  // 4. Dummy Application
  const { error: appError } = await supabase.from('applications').insert({
    position_id: posData.id,
    candidate_name: 'John Doe',
    candidate_email: 'john.doe@example.com',
    candidate_phone: '+15551234567',
    application_number: 'CS-FAC-202310-001',
    status: 'Applied',
    dynamic_responses_json: {
      'field_1': 'PhD',
      'field_2': '5'
    }
  });

  if (appError) {
    console.error("Error inserting application:", appError.message);
    return;
  }

  console.log("Successfully generated dummy data!");
}

generateData();
