import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const faculty = await User.find({ role: 'faculty' }).select('name email department').sort({ name: 1 }).lean();

    return NextResponse.json(faculty);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
