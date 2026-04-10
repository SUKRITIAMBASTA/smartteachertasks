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
    query.type = type;

    const user = session.user as any;

    // Enforce data isolation based on role
    if (user.role === 'admin') {
      if (departmentId) query.departmentId = departmentId;
      if (semester) query.semester = Number(semester);
      if (facultyId) query.facultyId = facultyId;
      if (roomId) query.roomId = roomId;
    } else if (user.role === 'faculty') {
      // 👨‍🏫 Faculty: Locked to semesters they actually teach in, and ALWAYS restricted to their own classes
      const taughtSubjects = await Subject.find({ assignedFaculty: user.id }).lean();
      const taughtSemesters = [...new Set(taughtSubjects.map(s => s.semester))];

      query.facultyId = user.id; // 🔥 Strict locking: Only show their own routine entries

      if (semester) {
        const requestedSem = Number(semester);
        if (taughtSemesters.includes(requestedSem)) {
          query.semester = requestedSem;
        } else {
          return NextResponse.json({ error: 'Access denied: You are not assigned to this semester.' }, { status: 403 });
        }
      }

      if (departmentId) query.departmentId = departmentId;
      query.status = 'approved';

    } else if (user.role === 'student') {
      // 🎓 Student: Default to assigned department/semester
      query.departmentId = departmentId || user.departmentId;
      query.semester = semester ? Number(semester) : (user.semester || 1);

      // 🔒 Finality: Only show approved routines in production
      query.status = 'approved';
    }

    // 2. Fetch & Populate for full routine context
    const schedules = await Schedule.find(query)
      .populate({ path: 'subjectId', select: 'name code' })
      .populate({ path: 'facultyId', select: 'name email' })
      .populate({ path: 'roomId', select: 'roomNo type' })
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Fetch Schedule Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
