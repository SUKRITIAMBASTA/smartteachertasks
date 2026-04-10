import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getResourceById } from '@/lib/controllers/resourceController';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Streaming Download API: University Local Storage.
 * Fetches institutional assets from public/uploads and serves as an attachment.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const resource = await getResourceById(id);
    if (!resource || !resource.publicId) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const localLocation = path.join(process.cwd(), 'public', 'uploads', resource.publicId);
    
    // Safety check for local file
    const { existsSync } = await import('fs');
    if (!existsSync(localLocation)) {
       return NextResponse.json({ 
         error: 'Academic file not found on server. This may be a legacy cloud record. Please delete and re-upload.' 
       }, { status: 404 });
    }

    const fileBin = await readFile(localLocation);

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${resource.fileName}"`);
    headers.set('Content-Type', resource.resourceType || 'application/octet-stream');
    headers.set('Content-Length', fileBin.length.toString());

    return new NextResponse(fileBin, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Download access failed: ' + error.message }, { status: 500 });
  }
}
