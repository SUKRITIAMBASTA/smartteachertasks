import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit quiz results.' }, { status: 403 });
    }

    const body = await req.json();
    const studentId = user.id; // 🔥 Security: Always use ID from session
    const { quizId, score, totalQuestions, difficultyLevel } = body;

    const result = await QuizResult.create({
      studentId: user.id,
      quizId,
      score,
      totalQuestions,
      difficultyLevel,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    const studentId = searchParams.get('studentId') || user.id;

    // Students can only see their own results unless they are faculty/admin
    const targetStudentId = (user.role === 'student' && studentId !== user.id) ? user.id : studentId;

    const query: any = { studentId: targetStudentId };
    if (quizId) query.quizId = quizId;

    const results = await QuizResult.find(query)
      .populate('quizId', 'title subjectId')
      .sort({ createdAt: -1 });

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
