import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { sendMail, buildConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract base fields
    const positionId = formData.get('positionId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const dob = formData.get('dob') as string;
    const dynamicResponsesStr = formData.get('dynamicResponses') as string;
    
    if (!positionId || !email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dynamicResponses = dynamicResponsesStr ? JSON.parse(dynamicResponsesStr) : {};

    // Handle photo upload to public bucket
    let photoUrl: string | null = null;
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile instanceof Blob && photoFile.size > 0) {
      const ext = photoFile.name?.split('.').pop() || 'jpg';
      const photoName = `${email.replace(/[@.]/g, '_')}_${Date.now()}.${ext}`;
      const { data: photoData, error: photoErr } = await supabaseServer.storage
        .from('photos')
        .upload(photoName, photoFile, { upsert: true });
      if (!photoErr && photoData) {
        const { data: urlData } = supabaseServer.storage.from('photos').getPublicUrl(photoData.path);
        photoUrl = urlData.publicUrl;
      }
    }

    // Generate App Number: e.g. {PREFIX}-YYYYMM-{COUNTER}
    const { data: posData } = await supabaseServer
      .from('positions')
      .select('app_prefix, next_counter')
      .eq('id', positionId)
      .single();

    const prefix = posData?.app_prefix || 'GEN';
    const counter = posData?.next_counter || 1;
    
    const dateStr = new Date().toISOString().replace(/-/g, '').substring(0, 6); // YYYYMM
    const seq = String(counter).padStart(3, '0');
    const applicationNumber = `${prefix}-${dateStr}-${seq}`;

    // Increment next_counter in positions
    await supabaseServer
      .from('positions')
      .update({ next_counter: counter + 1 })
      .eq('id', positionId);

    // Upload Files
    const fileEntries = Array.from(formData.entries()).filter(([key, val]) => val instanceof Blob);
    const uploadedFiles = [];

    for (const [key, val] of fileEntries) {
      const file = val as File;
      const ext = file.name.split('.').pop() || 'pdf';
      const storageFieldName = key.replace('file_', '');
      const newName = `${applicationNumber}_${storageFieldName}.${ext}`;
      
      const { data: uploadData, error: uploadErr } = await supabaseServer
        .storage
        .from('documents')
        .upload(newName, file, { upsert: true });

      if (!uploadErr && uploadData) {
         uploadedFiles.push({
           field_name: storageFieldName,
           file_url: uploadData.path
         });
      }
    }

    // Insert Application
    const { data: appData, error: appErr } = await supabaseServer
      .from('applications')
      .insert({
        position_id: positionId,
        candidate_name: fullName,
        candidate_email: email,
        candidate_phone: phone,
        candidate_dob: dob,
        application_number: applicationNumber,
        status: 'Applied',
        dynamic_responses_json: dynamicResponses,
        photo_url: photoUrl
      })
      .select()
      .single();

    if (appErr) throw appErr;

    // Insert File References
    if (uploadedFiles.length > 0) {
      const fileInserts = uploadedFiles.map(f => ({
         application_id: appData.id,
         field_name: f.field_name,
         file_url: f.file_url
      }));
      await supabaseServer.from('application_files').insert(fileInserts);
    }

    // Insert initial status log
    await supabaseServer.from('application_status_logs').insert({
       application_id: appData.id,
       status: 'Applied'
    });

    // Fetch branding for email
    const { data: brandings } = await supabaseServer.from('branding_settings').select('institute_name').limit(1);
    const instituteName = brandings && brandings.length > 0 ? brandings[0].institute_name : 'Faculty Recruitment Cell';

    // Fetch position details, department, and form schema
    const { data: fullPosData } = await supabaseServer
      .from('positions')
      .select(`
        title,
        departments(name),
        position_forms(schema_json)
      `)
      .eq('id', positionId)
      .single();

    const deptName = (fullPosData?.departments as any)?.name || 'General';
    const schemaJson = (fullPosData?.position_forms as any)?.[0]?.schema_json || [];
    const positionTitle = fullPosData?.title || 'Faculty Position';

    // Map technical Field IDs (field_xxx) to human-readable Labels
    const mappedResponses: Record<string, any> = {};
    schemaJson.forEach((field: any) => {
      const value = dynamicResponses[field.id];
      if (value !== undefined && value !== null) {
        mappedResponses[field.label] = value;
      }
    });

    // Send confirmation email (non-blocking)
    sendMail({
      to: email,
      subject: `Application Received: ${positionTitle} — ${applicationNumber}`,
      html: buildConfirmationEmail({
        candidateName: fullName,
        candidateEmail: email,
        candidatePhone: phone,
        positionTitle: positionTitle,
        departmentName: deptName,
        applicationNumber,
        dynamicResponses: mappedResponses,
      }),
    }).catch(err => console.error('Email send failed:', err));

    return NextResponse.json({ success: true, applicationNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
