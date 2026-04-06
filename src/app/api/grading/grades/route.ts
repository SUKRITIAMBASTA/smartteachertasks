import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitMarks, getGradesForSubject, getStudentGrades } from '@/lib/controllers/gradingController';

/**
 * 📥 Handle mark submissions and retrieval.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const studentId = (session.user as any).role === 'student' ? (session.user as any).id : searchParams.get('studentId');

    // 1. If studentId is provided, get grades for that specific student
    if (studentId) {
      const grades = await getStudentGrades(studentId);
      return NextResponse.json(grades);
    }

    // 2. If subjectId is provided, get all student grades for that subject (Faculty/Admin only)
    if (subjectId) {
      if (!['admin', 'faculty'].includes((session.user as any).role)) {
        return NextResponse.json({ error: 'Unauthorized: Academic access only' }, { status: 403 });
      }
      const grades = await getGradesForSubject(subjectId);
      return NextResponse.json(grades);
    }

    return NextResponse.json({ error: 'Subject or Student identifier required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized: Faculty access only' }, { status: 403 });
    }

    const body = await req.json();
    const result = await submitMarks({ ...body, gradedBy: (session.user as any).id });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
