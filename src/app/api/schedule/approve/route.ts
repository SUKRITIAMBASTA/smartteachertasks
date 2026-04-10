import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Schedule from '@/models/Schedule';

/**
 * ✅ Institutional Bulk Approval Engine.
 * Allows Administrators to vet and publish generated routines for students and faculty.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    // 🛡️ Admin Only Gate
    if (!session || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { departmentId, semester, facultyId, roomId } = await req.json();

    await dbConnect();

    // 1. Build Targeted Query for Validation
    let query: any = { status: 'pending_approval' }; // Default only to pending items
    if (departmentId) query.departmentId = departmentId;
    if (semester) query.semester = Number(semester);
    if (facultyId) query.facultyId = facultyId;
    if (roomId) query.roomId = roomId;

    // Remove status: 'pending_approval' if it was explicitly requested for all (optional)
    // Actually, it's safer to only approve pending ones.

    // 2. Perform Bulk Status Elevation
    const result = await Schedule.updateMany(query, { status: 'approved' });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully approved ${result.modifiedCount} institutional slots.`,
      count: result.modifiedCount 
    });
  } catch (error: any) {
    console.error('Schedule Approval Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
