import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createResource, 
  getResources, 
  deleteResource 
} from '@/lib/controllers/resourceController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');
    const role = (session.user as any).role;
    const department = (session.user as any).department;

    let query: any = {};
    if (course) query.course = course;
    
    // Students see resources from their department by default if no course is specified
    if (role === 'student' && !course) {
      query.department = department; 
    }

    const resources = await getResources(query);
    return NextResponse.json(resources);
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

    const body = await req.json();
    const { fileData, ...metadata } = body;

    if (!fileData) {
      return NextResponse.json({ error: 'File data required' }, { status: 400 });
    }

    const resource = await createResource(fileData, metadata, (session.user as any).id);

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deleteResource(id, (session.user as any).id, (session.user as any).role);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
