import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query: any = {};
    if (searchParams.get('departmentId')) query.departmentId = searchParams.get('departmentId');
    if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');
    if (searchParams.get('semester')) query.semester = parseInt(searchParams.get('semester') as string);

    const user = session.user as any;
    if (user.role === 'student') {
      // 🎓 Students: STRICTLY locked to their department and semester only
      query.departmentId = user.departmentId;
      query.semester = user.semester || 1;
    } else if (user.role === 'faculty') {
      // 👨‍🏫 Faculty: Allowed to see their department's quizzes or filter by subject
      if (user.departmentId) query.departmentId = user.departmentId;
    }
    // ⚡ Admin: Full institutional access

    const quizzes = await Quiz.find(query)
      .populate('departmentId subjectId createdBy', 'name branch code')
      .sort({ createdAt: -1 });

    return NextResponse.json(quizzes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !['admin', 'faculty'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const quiz = await Quiz.create({
      ...body,
      departmentId: body.departmentId || user.departmentId,
      createdBy: user.id,
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !['admin', 'faculty'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await Quiz.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
