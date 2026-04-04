import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function getAllAnnouncements(role: string) {
  await dbConnect();
  return Announcement.find({ $or: [{ targetRoles: role }, { targetRoles: { $size: 0 } }] })
    .populate('author', 'name email role')
    .sort({ pinned: -1, createdAt: -1 })
    .lean();
}

export async function createAnnouncement(data: { title: string; content: string; author: string; targetRoles: string[]; pinned: boolean }) {
  await dbConnect();
  const ann = await Announcement.create(data);
  return ann.toObject();
}

export async function deleteAnnouncement(id: string) {
  await dbConnect();
  return Announcement.findByIdAndDelete(id).lean();
}
