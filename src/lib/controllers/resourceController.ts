import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import mongoose from 'mongoose';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

// Unified University Upload Directory
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
if (!existsSync(UPLOAD_ROOT)) {
  mkdirSync(UPLOAD_ROOT, { recursive: true });
}

/**
 * Generates a collision-resistant name for institutional assets.
 */
function generateHubFileName(original: string): string {
  const ts = Date.now();
  const ext = path.extname(original).toLowerCase();
  const base = path.basename(original, ext).replace(/[^a-z0-9_-]/gi, '_').substring(0, 50);
  return `${ts}-${base}${ext}`;
}

/**
 * Hub Controller: Self-hosted Zero-API storage.
 * Directly saves academic materials to the server filesystem.
 */
export async function createResource(file: File, metadata: any, userId: string) {
  await dbConnect();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Storage Logic
  const localName = generateHubFileName(file.name);
  const localPath = path.join(UPLOAD_ROOT, localName);
  await writeFile(localPath, buffer);

  const resource = await Resource.create({
    title: metadata.title || file.name,
    description: metadata.description || '',
    url: `/uploads/${localName}`, // Transparent link for UI
    publicId: localName,         // Reference for deletion
    resourceType: file.type || 'application/octet-stream',
    fileType: file.name.split('.').pop()?.toLowerCase() || 'document',
    fileName: file.name,
    fileSize: file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(2)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    course: metadata.course || 'General',
    semester: metadata.semester || 1,
    departmentId: metadata.departmentId || null,
    category: metadata.category || 'Other',
    tags: metadata.tags ? metadata.tags.split(',').map((t: string) => t.trim()) : [],
    uploadedBy: new mongoose.Types.ObjectId(userId),
    approvalStatus: 'approved'
  });

  return resource;
}

export async function getResources(query: any = {}) {
  await dbConnect();
  return await Resource.find(query)
    .populate('uploadedBy', 'name email role department')
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Removes local academic materials from the server disk.
 */
export async function deleteResource(id: string, userId: string, role: string) {
  await dbConnect();
  const resource = await Resource.findById(id);

  if (!resource) throw new Error('Resource not found.');

  if (role !== 'admin' && resource.uploadedBy.toString() !== userId) {
    throw new Error('Not authorized to delete this resource.');
  }

  // Filesystem cleanup
  if (resource.publicId) {
    const localLocation = path.join(UPLOAD_ROOT, resource.publicId);
    try {
      if (existsSync(localLocation)) {
        await unlink(localLocation);
      }
    } catch (err) {
      console.error('[HubController] Discard error:', err);
    }
  }

  await Resource.findByIdAndDelete(id);
  return { success: true };
}

export async function getResourceById(id: string) {
  await dbConnect();
  return await Resource.findById(id).lean();
}
