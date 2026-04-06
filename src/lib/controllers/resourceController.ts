import dbConnect from '@/lib/db';
import Resource, { IResourceDoc } from '@/models/Resource';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';

export async function createResource(fileData: any, metadata: any, userId: string) {
  await dbConnect();

  // If simulate is enabled or fileData is missing, simulate the upload
  const uploadResult = await uploadToCloudinary(fileData, metadata.fileName);

  const resource = await Resource.create({
    title: metadata.title || metadata.fileName,
    description: metadata.description || '',
    url: uploadResult?.secure_url || '#',
    googleDriveFileId: uploadResult?.public_id || 'simulated',
    fileType: metadata.fileType || 'document',
    fileName: metadata.fileName,
    fileSize: metadata.fileSize || 'Unknown',
    course: metadata.course || 'General',
    category: metadata.category || 'Other',
    tags: metadata.tags || [],
    uploadedBy: new mongoose.Types.ObjectId(userId)
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

export async function deleteResource(id: string, userId: string, role: string) {
  await dbConnect();
  const resource = await Resource.findById(id);
  
  if (!resource) throw new Error('Resource not found.');
  
  // Only admin or the uploader can delete
  if (role !== 'admin' && resource.uploadedBy.toString() !== userId) {
    throw new Error('Not authorized to delete this resource.');
  }

  if (resource.googleDriveFileId) {
    // Note: For Drive deletion, we usually handle it in the API where the token is available
    // await deleteFromGoogleDrive(token, resource.googleDriveFileId);
  }

  await Resource.findByIdAndDelete(id);
  return { success: true };
}
