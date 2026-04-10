import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query: any = {};

    // Optional filters
    if (searchParams.get('departmentId')) query.departmentId = searchParams.get('departmentId');
    if (searchParams.get('semester'))     query.semester     = parseInt(searchParams.get('semester') as string);
    if (searchParams.get('session'))      query.session      = searchParams.get('session');

    const user = session.user as any;
    if (user.role === 'student') {
      if (user.departmentId) query.departmentId = user.departmentId;
      if (user.semester)     query.semester     = user.semester;
    } else if (user.role === 'faculty') {
      // 👨‍🏫 Faculty: Strictly show their own subjects
      query.assignedFaculty = user.id;
    }

    const data = await Subject.find(query)
      .populate('assignedFaculty', 'name email')
      .populate('departmentId', 'name branch institution')
      .sort({ semester: 1, name: 1 })
      .lean();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();
    const data = await Subject.create(body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, assignedFaculty } = await req.json();
    const data = await Subject.findByIdAndUpdate(
      id,
      { assignedFaculty: assignedFaculty || null },
      { new: true }
    );
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get('id');
    await Subject.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
