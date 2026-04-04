import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveGrades, getGradesByRubric } from '@/lib/controllers/gradingController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const rubricId = searchParams.get('rubricId');

    if (!rubricId) return NextResponse.json({ error: 'RubricId required' }, { status: 400 });

    const grades = await getGradesByRubric(rubricId, (session.user as any).id);
    return NextResponse.json(grades);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { rubricId, gradesData } = await req.json();

    if (!rubricId || !gradesData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const savedGradesResult = await saveGrades(rubricId, (session.user as any).id, gradesData);

    return NextResponse.json({ success: true, count: savedGradesResult.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
