import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Schedule from '@/models/Schedule';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import User from '@/models/User';
import Room from '@/models/Room';

/**
 * 🎓 Fetch specific institutional routines based on Department and Semester.
 * Optimized for the Weekly Routine Grid visualization.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');
    const facultyId = searchParams.get('facultyId');
    const roomId = searchParams.get('roomId');
    const type = searchParams.get('type') || 'routine';

    await dbConnect();

    // 1. Build Query with Visibility Gates
    let query: any = {};
    if (departmentId) query.departmentId = departmentId;
    if (semester) query.semester = Number(semester);
    if (facultyId) query.facultyId = facultyId;
    if (roomId) query.roomId = roomId;

    // 🔒 Students/Faculty can ONLY see approved routines
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      query.status = 'approved';
    }

    // 2. Fetch & Populate for full routine context
    const schedules = await Schedule.find(query)
      .populate('subjectId', 'name code')
      .populate('facultyId', 'name email')
      .populate('roomId', 'roomNo type')
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Fetch Schedule Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
