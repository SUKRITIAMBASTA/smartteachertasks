import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function getAllTickets(role: string, userId: string) {
  await dbConnect();
  if (role === 'admin') {
    return Ticket.find().populate('createdBy', 'name email role').populate('assignedTo', 'name email').sort({ createdAt: -1 }).lean();
  }
  return Ticket.find({ createdBy: userId }).populate('createdBy', 'name email role').sort({ createdAt: -1 }).lean();
}

export async function createTicket(data: { title: string; description: string; category: string; priority: string; createdBy: string }) {
  await dbConnect();
  const ticket = await Ticket.create(data);
  return ticket.toObject();
}

export async function updateTicketStatus(ticketId: string, status: string, role: string) {
  await dbConnect();
  if (role !== 'admin') throw new Error('Unauthorized');
  return Ticket.findByIdAndUpdate(ticketId, { status }, { new: true }).lean();
}

export async function addComment(ticketId: string, text: string, authorId: string) {
  await dbConnect();
  return Ticket.findByIdAndUpdate(ticketId, { $push: { comments: { text, author: authorId } } }, { new: true }).populate('comments.author', 'name email').lean();
}

export async function getTicketStats() {
  await dbConnect();
  const [total, open, inProgress, resolved] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'open' }),
    Ticket.countDocuments({ status: 'in_progress' }),
    Ticket.countDocuments({ status: 'resolved' }),
  ]);
  return { total, open, inProgress, resolved };
}
