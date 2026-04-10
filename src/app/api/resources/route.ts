import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createResource, getResources, deleteResource } from '@/lib/controllers/resourceController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query: any = {};
    if (searchParams.get('course')) query.course = searchParams.get('course');
    if (searchParams.get('category')) query.category = searchParams.get('category');

    const user = session.user as any;
    if (user.role === 'student') {
      // 🎓 Students: Locked to their specific department and semester
      query.departmentId = user.departmentId;
      query.semester = user.semester || 1;
    } else if (user.role === 'faculty') {
      // 👨‍🏫 Faculty: See everything in their assigned department
      query.departmentId = user.departmentId;
    }
    // ⚡ Admin: No restrictions unless params provided

    const resources = await getResources(query);
    return NextResponse.json(resources);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    if (!session || !['admin', 'faculty'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const metadata = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      course: formData.get('course') as string,
      semester: parseInt(formData.get('semester') as string) || 1,
      category: formData.get('category') as string,
      tags: formData.get('tags') as string,
      departmentId: user.departmentId
    };

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const resource = await createResource(file, metadata, user.id);
    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error('API Resource POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const result = await deleteResource(id, user.id, user.role);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
