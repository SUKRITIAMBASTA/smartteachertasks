import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFacultySubjects, getStudentsForFaculty } from '@/lib/controllers/gradingController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized: Faculty access only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'subjects' or 'students'

    const facultyId = (session.user as any).id;

    if (type === 'subjects') {
      const subjects = await getFacultySubjects(facultyId);
      return NextResponse.json(subjects);
    }

    if (type === 'students') {
      const students = await getStudentsForFaculty(facultyId);
      return NextResponse.json(students);
    }

    return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
