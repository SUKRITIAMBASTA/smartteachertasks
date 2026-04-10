import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    const result = await User.updateMany(
      { 
        $or: [
          { isVerified: { $exists: false } },
          { idPending: { $exists: false } },
          { idDocumentUrl: { $eq: "" } },
          { idDocumentUrl: { $exists: false } }
        ]
      },
      [
        {
          $set: {
            isVerified: { $ifNull: ["$isVerified", false] },
            idDocumentUrl: { $ifNull: ["$idDocumentUrl", ""] },
            idPending: {
              $cond: {
                if: { $or: [{ $eq: ["$isVerified", true] }, { $ne: ["$idDocumentUrl", ""] }] },
                then: false,
                else: true
              }
            }
          }
        }
      ]
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
