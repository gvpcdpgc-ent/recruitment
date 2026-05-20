import { supabaseServer } from '@/lib/supabase/server';

export async function logAdminAction(adminId: string, action: string, targetTable: string, targetId: string, details: any = {}) {
  try {
    const { error } = await supabaseServer
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        details: JSON.stringify(details)
      });
      
    if (error) {
      console.error('Audit Log Error:', error);
    }
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
