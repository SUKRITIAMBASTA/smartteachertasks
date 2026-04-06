import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { uploadToGoogleDrive, deleteFromGoogleDrive } from '@/lib/googleDriveService';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');
    const category = searchParams.get('category');
    const role = (session.user as any).role;

    let query: any = {};
    if (course) query.course = course;
    if (category) query.category = category;

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email role department')
      .sort({ createdAt: -1 })
      .lean();

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

    const accessToken = user.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Google Access Token missing. Please log in with Google.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const course = formData.get('course') as string;
    const category = formData.get('category') as string;
    const tagsStr = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Upload to Google Drive directly
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const driveResult = await uploadToGoogleDrive(
      accessToken,
      buffer,
      file.name,
      file.type
    );

    await dbConnect();

    // 2. Save metadata to MongoDB
    const resource = await Resource.create({
      title: title || file.name,
      description: description || '',
      url: driveResult.webContentLink || driveResult.webViewLink,
      googleDriveFileId: driveResult.id,
      fileType: file.type.split('/')[1] || 'document',
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      course: course || 'General',
      category: category || 'Other',
      tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : [],
      uploadedBy: new mongoose.Types.ObjectId(user.id),
      approvalStatus: 'approved' // Auto-approve for now
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error('API Resource POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbConnect();
    const resource = await Resource.findById(id);
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    // Permissions check
    if (user.role !== 'admin' && resource.uploadedBy.toString() !== user.id) {
       return NextResponse.json({ error: 'Not authorized to delete' }, { status: 403 });
    }

    // Delete from Google Drive if token is available
    if (resource.googleDriveFileId && user.accessToken) {
      await deleteFromGoogleDrive(user.accessToken, resource.googleDriveFileId);
    }

    await Resource.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
