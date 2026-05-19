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

    // Generate App Number: e.g. DEPT-FAC-YYYYMM-001
    // We will do a simple prefix based on position's department
    const { data: posData } = await supabaseServer
      .from('positions')
      .select('departments(name)')
      .eq('id', positionId)
      .single();

    let prefix = 'GEN';
    const dept = posData?.departments as any;
    if (dept && !Array.isArray(dept) && dept.name) {
      prefix = dept.name.substring(0, 3).toUpperCase();
    }
    
    const dateStr = new Date().toISOString().replace(/-/g, '').substring(0, 6); // YYYYMM
    
    // Get count for sequence
    const { count } = await supabaseServer
      .from('applications')
      .select('*', { count: 'exact', head: true });
      
    const seq = ((count || 0) + 1).toString().padStart(3, '0');
    const applicationNumber = `${prefix}-FAC-${dateStr}-${seq}`;

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

    // Fetch position title
    const { data: positionData } = await supabaseServer.from('positions').select('title').eq('id', positionId).single();

    // Send confirmation email (non-blocking — we don't fail the request if email fails)
    sendMail({
      to: email,
      subject: `Application Received: ${positionData?.title || 'Faculty Position'} — ${applicationNumber}`,
      html: buildConfirmationEmail({
        candidateName: fullName,
        positionTitle: positionData?.title || 'Faculty Position',
        applicationNumber,
        instituteName,
      }),
    }).catch(err => console.error('Email send failed:', err));

    return NextResponse.json({ success: true, applicationNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
