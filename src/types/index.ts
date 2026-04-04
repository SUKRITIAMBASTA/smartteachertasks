export type Role = 'admin' | 'faculty' | 'student';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'academic' | 'administrative' | 'infrastructure' | 'other';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITicket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: IUser | string;
  assignedTo?: IUser | string;
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  text: string;
  author: IUser | string;
  createdAt: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: IUser | string;
  targetRoles: Role[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IResource {
  _id: string;
  title: string;
  description: string;
  url: string;
  fileType: string;
  uploadedBy: IUser | string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
